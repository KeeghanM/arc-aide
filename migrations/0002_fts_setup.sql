-- FTS5 table for searching https://www.sqlite.org/fts5.html
CREATE VIRTUAL TABLE IF NOT EXISTS search_index_fts USING fts5(
    type,
    entity_id UNINDEXED,
    campaign_id UNINDEXED,
    title,
    content,
    slug
);
--> statement-breakpoint

-- Create auxiliary table to extract FTS terms  
CREATE VIRTUAL TABLE IF NOT EXISTS search_index_fts_aux USING fts5vocab('search_index_fts', 'instance');
--> statement-breakpoint

-- Create the triggers which keep the FTS table in sync with the main table
DROP TRIGGER IF EXISTS arc_search_delete;
--> statement-breakpoint
CREATE TRIGGER arc_search_delete AFTER DELETE ON arc BEGIN
  DELETE FROM search_index_fts WHERE type = 'arc' AND entity_id = OLD.id;
END
--> statement-breakpoint
DROP TRIGGER IF EXISTS thing_search_delete;
--> statement-breakpoint
CREATE TRIGGER thing_search_delete AFTER DELETE ON thing BEGIN
  DELETE FROM search_index_fts WHERE type = 'thing' AND entity_id = OLD.id;
END
--> statement-breakpoint
DROP TRIGGER IF EXISTS arc_search_insert;
--> statement-breakpoint
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
END
--> statement-breakpoint
DROP TRIGGER IF EXISTS arc_search_update;
--> statement-breakpoint
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
END
--> statement-breakpoint
DROP TRIGGER IF EXISTS thing_search_insert;
--> statement-breakpoint
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
END
--> statement-breakpoint
DROP TRIGGER IF EXISTS thing_search_update;
--> statement-breakpoint
CREATE TRIGGER thing_search_update AFTER UPDATE ON thing BEGIN
  UPDATE search_index_fts SET
    title = COALESCE(NEW.name, ''),
    content = COALESCE(NEW.description_text, ''),
    slug = NEW.slug
  WHERE type = 'thing' AND entity_id = NEW.id;
END
--> statement-breakpoint
DROP TRIGGER IF EXISTS vocabulary_sync_arc_insert;
--> statement-breakpoint
CREATE TRIGGER vocabulary_sync_arc_insert 
AFTER INSERT ON arc 
BEGIN
  -- Simply increment frequency counters for any terms that might match
  -- Let the FTS system handle the actual word extraction
  UPDATE search_vocabulary 
  SET frequency = frequency + 1 
  WHERE search_vocabulary.term IN (
    SELECT DISTINCT term FROM search_index_fts_aux 
    WHERE search_index_fts_aux.term LIKE '%' || LOWER(NEW.name) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.hook_text, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.protagonist_text, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.antagonist_text, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.problem_text, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.key_text, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.outcome_text, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.notes_text, '')) || '%'
  );
END
--> statement-breakpoint
DROP TRIGGER IF EXISTS vocabulary_sync_arc_update;
--> statement-breakpoint
CREATE TRIGGER vocabulary_sync_arc_update
AFTER UPDATE ON arc 
BEGIN
  -- Simply increment frequency counters for any terms that might match
  UPDATE search_vocabulary 
  SET frequency = frequency + 1 
  WHERE search_vocabulary.term IN (
    SELECT DISTINCT term FROM search_index_fts_aux 
    WHERE search_index_fts_aux.term LIKE '%' || LOWER(NEW.name) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.hook_text, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.protagonist_text, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.antagonist_text, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.problem_text, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.key_text, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.outcome_text, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.notes_text, '')) || '%'
  );
END
--> statement-breakpoint
DROP TRIGGER IF EXISTS vocabulary_sync_thing_insert;
--> statement-breakpoint
CREATE TRIGGER vocabulary_sync_thing_insert 
AFTER INSERT ON thing 
BEGIN
  -- Simply increment frequency counters for any terms that might match
  UPDATE search_vocabulary 
  SET frequency = frequency + 1 
  WHERE search_vocabulary.term IN (
    SELECT DISTINCT term FROM search_index_fts_aux 
    WHERE search_index_fts_aux.term LIKE '%' || LOWER(NEW.name) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.description_text, '')) || '%'
  );
END
--> statement-breakpoint
DROP TRIGGER IF EXISTS vocabulary_sync_thing_update;
--> statement-breakpoint
CREATE TRIGGER vocabulary_sync_thing_update
AFTER UPDATE ON thing 
BEGIN
  -- Simply increment frequency counters for any terms that might match
  UPDATE search_vocabulary 
  SET frequency = frequency + 1 
  WHERE search_vocabulary.term IN (
    SELECT DISTINCT term FROM search_index_fts_aux 
    WHERE search_index_fts_aux.term LIKE '%' || LOWER(NEW.name) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.description_text, '')) || '%'
  );
END
--> statement-breakpoint