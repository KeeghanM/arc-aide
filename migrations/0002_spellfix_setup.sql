-- Add fuzzy search support using Turso's fuzzy extension
-- This uses the fuzzy extension which is available in Turso/LibSQL
-- The fuzzy extension provides string distance functions like levenshtein, edit_distance, etc.

-- Create a vocabulary table to store terms for fuzzy matching
CREATE TABLE IF NOT EXISTS search_vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term TEXT NOT NULL UNIQUE COLLATE NOCASE,
    frequency INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_search_vocabulary_term ON search_vocabulary(term);
--> statement-breakpoint

-- Create auxiliary table to extract FTS terms  
CREATE VIRTUAL TABLE IF NOT EXISTS search_index_fts_aux USING fts5vocab('search_index_fts', 'instance');
--> statement-breakpoint

-- Populate vocabulary table with existing FTS terms
INSERT OR IGNORE INTO search_vocabulary(term, frequency) 
SELECT term, count(*) as frequency
FROM search_index_fts_aux 
WHERE LENGTH(term) > 2 AND term GLOB '[a-zA-Z]*'
GROUP BY term;
--> statement-breakpoint

-- Drop existing arc triggers and recreate them
DROP TRIGGER IF EXISTS vocabulary_sync_arc_insert;
DROP TRIGGER IF EXISTS vocabulary_sync_arc_update;

-- Simple trigger for arc inserts - just add the full text content to vocabulary as terms
-- The FTS system will handle the actual word extraction and indexing
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
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.key, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.outcome_text, '')) || '%'
  );
END;
--> statement-breakpoint

-- Simple trigger for arc updates
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
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.key, '')) || '%'
       OR search_index_fts_aux.term LIKE '%' || LOWER(COALESCE(NEW.outcome_text, '')) || '%'
  );
END;
--> statement-breakpoint

-- Drop existing thing triggers and recreate them
DROP TRIGGER IF EXISTS vocabulary_sync_thing_insert;
DROP TRIGGER IF EXISTS vocabulary_sync_thing_update;

-- Simple trigger for thing inserts
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
END;
--> statement-breakpoint

-- Simple trigger for thing updates
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
END;