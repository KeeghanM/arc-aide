-- Update FTS triggers to use plain text columns instead of JSON extraction

-- Drop existing triggers
DROP TRIGGER IF EXISTS arc_search_insert;
--> statement-breakpoint
DROP TRIGGER IF EXISTS arc_search_update;
--> statement-breakpoint
DROP TRIGGER IF EXISTS thing_search_insert;
--> statement-breakpoint
DROP TRIGGER IF EXISTS thing_search_update;
--> statement-breakpoint

-- Recreate triggers using plain text columns
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
    COALESCE(NEW.key, '') || ' ' ||
    COALESCE(NEW.outcome_text, ''),
    NEW.slug
  );
END;
--> statement-breakpoint

CREATE TRIGGER arc_search_update AFTER UPDATE ON arc BEGIN
  UPDATE search_index_fts SET
    title = NEW.name,
    content = COALESCE(NEW.hook_text, '') || ' ' ||
              COALESCE(NEW.protagonist_text, '') || ' ' ||
              COALESCE(NEW.antagonist_text, '') || ' ' ||
              COALESCE(NEW.problem_text, '') || ' ' ||
              COALESCE(NEW.key, '') || ' ' ||
              COALESCE(NEW.outcome_text, ''),
    slug = NEW.slug
  WHERE type = 'arc' AND entity_id = NEW.id;
END;
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
END;
--> statement-breakpoint

CREATE TRIGGER thing_search_update AFTER UPDATE ON thing BEGIN
  UPDATE search_index_fts SET
    title = COALESCE(NEW.name, ''),
    content = COALESCE(NEW.description_text, ''),
    slug = NEW.slug
  WHERE type = 'thing' AND entity_id = NEW.id;
END;