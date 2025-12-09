-- Drop the triggers that caused the "GLOB/LIKE pattern too complex" crash
DROP TRIGGER IF EXISTS vocabulary_sync_arc_insert;
DROP TRIGGER IF EXISTS vocabulary_sync_arc_update;
DROP TRIGGER IF EXISTS vocabulary_sync_thing_insert;
DROP TRIGGER IF EXISTS vocabulary_sync_thing_update;

-- Drop the manual table that required constant updating
DROP TABLE IF EXISTS search_vocabulary;

-- Drop any previous versions of the View (if re-running this script)
DROP VIEW IF EXISTS search_vocabulary;

-- Drop the old auxiliary table if it exists to avoid confusion
DROP TABLE IF EXISTS search_index_fts_aux;


-- Ensure the main FTS5 index exists
CREATE VIRTUAL TABLE IF NOT EXISTS search_index_fts USING fts5(
    type,
    entity_id UNINDEXED,
    campaign_id UNINDEXED,
    title,
    content,
    slug
);

-- Create a native virtual table that reads directly from the index.
-- This is instant, requires no triggers, and handles large text automatically.
CREATE VIRTUAL TABLE IF NOT EXISTS search_vocabulary_native USING fts5vocab('search_index_fts', 'row');

-- Create a Compatibility View.
-- This tricks your application code into thinking the 'search_vocabulary' table 
-- still exists with 'term' and 'frequency' columns.
CREATE VIEW search_vocabulary AS 
SELECT 
    term, 
    cnt AS frequency 
FROM search_vocabulary_native;



-- --- ARC TRIGGERS ---
DROP TRIGGER IF EXISTS arc_search_insert;
CREATE TRIGGER arc_search_insert AFTER INSERT ON arc BEGIN
  INSERT INTO search_index_fts(type, entity_id, campaign_id, title, content, slug)
  VALUES(
    'arc',
    NEW.id,
    NEW.campaign_id,
    NEW.name,
    COALESCE(NEW.hook_text, '') || ' ' ||
    COALESCE(NEW.protagonist_text, '') || ' ' ||
    COALESCE(NEW.antagonist_text, '') || ' ' ||
    COALESCE(NEW.problem_text, '') || ' ' ||
    COALESCE(NEW.key_text, '') || ' ' ||
    COALESCE(NEW.outcome_text, '') || ' ' ||
    COALESCE(NEW.notes_text, ''),
    NEW.slug
  );
END;

DROP TRIGGER IF EXISTS arc_search_update;
CREATE TRIGGER arc_search_update AFTER UPDATE ON arc BEGIN
  UPDATE search_index_fts SET
    title = NEW.name,
    content = COALESCE(NEW.hook_text, '') || ' ' ||
              COALESCE(NEW.protagonist_text, '') || ' ' ||
              COALESCE(NEW.antagonist_text, '') || ' ' ||
              COALESCE(NEW.problem_text, '') || ' ' ||
              COALESCE(NEW.key_text, '') || ' ' ||
              COALESCE(NEW.outcome_text, '') || ' ' ||
              COALESCE(NEW.notes_text, ''),
    slug = NEW.slug
  WHERE type = 'arc' AND entity_id = NEW.id;
END;

DROP TRIGGER IF EXISTS arc_search_delete;
CREATE TRIGGER arc_search_delete AFTER DELETE ON arc BEGIN
  DELETE FROM search_index_fts WHERE type = 'arc' AND entity_id = OLD.id;
END;


-- --- THING TRIGGERS ---

DROP TRIGGER IF EXISTS thing_search_insert;
CREATE TRIGGER thing_search_insert AFTER INSERT ON thing BEGIN
  INSERT INTO search_index_fts(type, entity_id, campaign_id, title, content, slug)
  VALUES(
    'thing',
    NEW.id,
    NEW.campaign_id,
    COALESCE(NEW.name, ''),
    COALESCE(NEW.description_text, ''),
    NEW.slug
  );
END;

DROP TRIGGER IF EXISTS thing_search_update;
CREATE TRIGGER thing_search_update AFTER UPDATE ON thing BEGIN
  UPDATE search_index_fts SET
    title = COALESCE(NEW.name, ''),
    content = COALESCE(NEW.description_text, ''),
    slug = NEW.slug
  WHERE type = 'thing' AND entity_id = NEW.id;
END;

DROP TRIGGER IF EXISTS thing_search_delete;
CREATE TRIGGER thing_search_delete AFTER DELETE ON thing BEGIN
  DELETE FROM search_index_fts WHERE type = 'thing' AND entity_id = OLD.id;
END;