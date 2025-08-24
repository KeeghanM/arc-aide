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

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_search_vocabulary_term ON search_vocabulary(term);

-- Create auxiliary table to extract FTS terms  
CREATE VIRTUAL TABLE IF NOT EXISTS search_index_fts_aux USING fts5vocab('search_index_fts', 'instance');

-- Populate vocabulary table with existing FTS terms
INSERT OR IGNORE INTO search_vocabulary(term, frequency) 
SELECT term, count(*) as frequency
FROM search_index_fts_aux 
WHERE LENGTH(term) > 2 AND term GLOB '[a-zA-Z]*'
GROUP BY term;

-- Create triggers on base tables to automatically add new terms when content is updated
-- These triggers will fire when the underlying data changes, which will also update the FTS table

-- Trigger for arc inserts - extract terms from arc data
CREATE TRIGGER IF NOT EXISTS vocabulary_sync_arc_insert 
AFTER INSERT ON arc 
BEGIN
  -- Extract words from arc name and content fields
  INSERT OR IGNORE INTO search_vocabulary(term)
  SELECT DISTINCT LOWER(TRIM(value)) as term
  FROM (
    -- Extract from arc name
    SELECT value 
    FROM json_each('["' || REPLACE(REPLACE(LOWER(NEW.name), ' ', '","'), '-', '","') || '"]')
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    -- Extract from hook
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.hook, '$'), '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    -- Extract from protagonist
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.protagonist, '$'), '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    -- Extract from antagonist
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.antagonist, '$'), '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    -- Extract from problem
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.problem, '$'), '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    -- Extract from key
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(NEW.key, '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    -- Extract from outcome
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.outcome, '$'), '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
  ) 
  WHERE TRIM(value) GLOB '[a-zA-Z]*';
  
  -- Update frequency for existing terms
  UPDATE search_vocabulary 
  SET frequency = frequency + 1 
  WHERE term IN (
    SELECT DISTINCT LOWER(TRIM(value))
    FROM (
      SELECT value 
      FROM json_each('["' || REPLACE(REPLACE(LOWER(NEW.name), ' ', '","'), '-', '","') || '"]')
      WHERE LENGTH(TRIM(value)) > 2
      UNION
      SELECT value
      FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.hook, '$'), '')), ' ', '","'), '-', '","') || '"]') 
      WHERE LENGTH(TRIM(value)) > 2
      UNION
      SELECT value
      FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.protagonist, '$'), '')), ' ', '","'), '-', '","') || '"]') 
      WHERE LENGTH(TRIM(value)) > 2
      UNION
      SELECT value
      FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.antagonist, '$'), '')), ' ', '","'), '-', '","') || '"]') 
      WHERE LENGTH(TRIM(value)) > 2
      UNION
      SELECT value
      FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.problem, '$'), '')), ' ', '","'), '-', '","') || '"]') 
      WHERE LENGTH(TRIM(value)) > 2
      UNION
      SELECT value
      FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(NEW.key, '')), ' ', '","'), '-', '","') || '"]') 
      WHERE LENGTH(TRIM(value)) > 2
      UNION
      SELECT value
      FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.outcome, '$'), '')), ' ', '","'), '-', '","') || '"]') 
      WHERE LENGTH(TRIM(value)) > 2
    ) 
    WHERE TRIM(value) GLOB '[a-zA-Z]*'
  );
END;

-- Trigger for arc updates
CREATE TRIGGER IF NOT EXISTS vocabulary_sync_arc_update
AFTER UPDATE ON arc 
BEGIN
  -- Extract words from updated arc data
  INSERT OR IGNORE INTO search_vocabulary(term)
  SELECT DISTINCT LOWER(TRIM(value)) as term
  FROM (
    SELECT value 
    FROM json_each('["' || REPLACE(REPLACE(LOWER(NEW.name), ' ', '","'), '-', '","') || '"]')
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.hook, '$'), '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.protagonist, '$'), '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.antagonist, '$'), '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.problem, '$'), '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(NEW.key, '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.outcome, '$'), '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
  ) 
  WHERE TRIM(value) GLOB '[a-zA-Z]*';
END;

-- Trigger for thing inserts - extract terms from thing data
CREATE TRIGGER IF NOT EXISTS vocabulary_sync_thing_insert 
AFTER INSERT ON thing 
BEGIN
  -- Extract words from thing name and description
  INSERT OR IGNORE INTO search_vocabulary(term)
  SELECT DISTINCT LOWER(TRIM(value)) as term
  FROM (
    -- Extract from thing name
    SELECT value 
    FROM json_each('["' || REPLACE(REPLACE(LOWER(NEW.name), ' ', '","'), '-', '","') || '"]')
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    -- Extract from description
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.description, '$'), '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
  ) 
  WHERE TRIM(value) GLOB '[a-zA-Z]*';
  
  -- Update frequency for existing terms
  UPDATE search_vocabulary 
  SET frequency = frequency + 1 
  WHERE term IN (
    SELECT DISTINCT LOWER(TRIM(value))
    FROM (
      SELECT value 
      FROM json_each('["' || REPLACE(REPLACE(LOWER(NEW.name), ' ', '","'), '-', '","') || '"]')
      WHERE LENGTH(TRIM(value)) > 2
      UNION
      SELECT value
      FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.description, '$'), '')), ' ', '","'), '-', '","') || '"]') 
      WHERE LENGTH(TRIM(value)) > 2
    ) 
    WHERE TRIM(value) GLOB '[a-zA-Z]*'
  );
END;

-- Trigger for thing updates
CREATE TRIGGER IF NOT EXISTS vocabulary_sync_thing_update
AFTER UPDATE ON thing 
BEGIN
  -- Extract words from updated thing data
  INSERT OR IGNORE INTO search_vocabulary(term)
  SELECT DISTINCT LOWER(TRIM(value)) as term
  FROM (
    SELECT value 
    FROM json_each('["' || REPLACE(REPLACE(LOWER(NEW.name), ' ', '","'), '-', '","') || '"]')
    WHERE LENGTH(TRIM(value)) > 2
    UNION
    SELECT value
    FROM json_each('["' || REPLACE(REPLACE(LOWER(COALESCE(json_extract(NEW.description, '$'), '')), ' ', '","'), '-', '","') || '"]') 
    WHERE LENGTH(TRIM(value)) > 2
  ) 
  WHERE TRIM(value) GLOB '[a-zA-Z]*';
END;
