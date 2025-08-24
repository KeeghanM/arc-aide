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
-- Trigger for arc inserts
CREATE TRIGGER IF NOT EXISTS arc_search_insert AFTER INSERT ON arc BEGIN
  INSERT INTO search_index_fts(type, entity_id, campaign_id, title, content, slug)
  VALUES(
    'arc',
    NEW.id,
    NEW.campaign_id,
    NEW.name,
    COALESCE(json_extract(NEW.hook, '$'), '') || ' ' ||
    COALESCE(json_extract(NEW.protagonist, '$'), '') || ' ' ||
    COALESCE(json_extract(NEW.antagonist, '$'), '') || ' ' ||
    COALESCE(json_extract(NEW.problem, '$'), '') || ' ' ||
    COALESCE(NEW.key, '') || ' ' ||
    COALESCE(json_extract(NEW.outcome, '$'), ''),
    NEW.slug
  );
END;
--> statement-breakpoint
-- Trigger for arc updates
CREATE TRIGGER IF NOT EXISTS arc_search_update AFTER UPDATE ON arc BEGIN
  UPDATE search_index_fts SET
    title = NEW.name,
    content = COALESCE(json_extract(NEW.hook, '$'), '') || ' ' ||
              COALESCE(json_extract(NEW.protagonist, '$'), '') || ' ' ||
              COALESCE(json_extract(NEW.antagonist, '$'), '') || ' ' ||
              COALESCE(json_extract(NEW.problem, '$'), '') || ' ' ||
              COALESCE(NEW.key, '') || ' ' ||
              COALESCE(json_extract(NEW.outcome, '$'), ''),
    slug = NEW.slug
  WHERE type = 'arc' AND entity_id = NEW.id;
END;

--> statement-breakpoint

-- Trigger for arc deletes
CREATE TRIGGER IF NOT EXISTS arc_search_delete AFTER DELETE ON arc BEGIN
  DELETE FROM search_index_fts WHERE type = 'arc' AND entity_id = OLD.id;
END;
--> statement-breakpoint

-- Trigger for thing inserts
CREATE TRIGGER IF NOT EXISTS thing_search_insert AFTER INSERT ON thing BEGIN
  INSERT INTO search_index_fts(type, entity_id, campaign_id, title, content, slug)
  VALUES(
    'thing',
    NEW.id,
    NEW.campaign_id,
    COALESCE(NEW.name, ''),
    COALESCE(json_extract(NEW.description, '$'), ''),
    NEW.slug
  );
END;
--> statement-breakpoint

-- Trigger for thing updates
CREATE TRIGGER IF NOT EXISTS thing_search_update AFTER UPDATE ON thing BEGIN
  UPDATE search_index_fts SET
    title = COALESCE(NEW.name, ''),
    content = COALESCE(json_extract(NEW.description, '$'), ''),
    slug = NEW.slug
  WHERE type = 'thing' AND entity_id = NEW.id;
END;
--> statement-breakpoint

-- Trigger for thing deletes
CREATE TRIGGER IF NOT EXISTS thing_search_delete AFTER DELETE ON thing BEGIN
  DELETE FROM search_index_fts WHERE type = 'thing' AND entity_id = OLD.id;
END;
