-- Update existing records (extract text from existing JSON)
-- This is a simplified extraction - you may want to run a more sophisticated extraction script
UPDATE arc SET 
  hook_text = CASE 
    WHEN hook IS NOT NULL THEN replace(replace(replace(json_extract(hook, '$'), '"', ''), '[', ''), ']', '') 
    ELSE '' 
  END,
  protagonist_text = CASE 
    WHEN protagonist IS NOT NULL THEN replace(replace(replace(json_extract(protagonist, '$'), '"', ''), '[', ''), ']', '') 
    ELSE '' 
  END,
  antagonist_text = CASE 
    WHEN antagonist IS NOT NULL THEN replace(replace(replace(json_extract(antagonist, '$'), '"', ''), '[', ''), ']', '') 
    ELSE '' 
  END,
  problem_text = CASE 
    WHEN problem IS NOT NULL THEN replace(replace(replace(json_extract(problem, '$'), '"', ''), '[', ''), ']', '') 
    ELSE '' 
  END,
  outcome_text = CASE 
    WHEN outcome IS NOT NULL THEN replace(replace(replace(json_extract(outcome, '$'), '"', ''), '[', ''), ']', '') 
    ELSE '' 
  END;
--> statement-breakpoint

UPDATE thing SET 
  description_text = CASE 
    WHEN description IS NOT NULL THEN replace(replace(replace(json_extract(description, '$'), '"', ''), '[', ''), ']', '') 
    ELSE '' 
  END;