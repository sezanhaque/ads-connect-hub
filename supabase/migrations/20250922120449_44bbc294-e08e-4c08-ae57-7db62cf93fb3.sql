-- Clean up all existing Meta-related data
DELETE FROM metrics WHERE campaign_id IN (
  SELECT id FROM campaigns WHERE name LIKE '%Campaign%' OR name LIKE '%Demo%'
);

DELETE FROM campaigns WHERE name LIKE '%Campaign%' OR name LIKE '%Demo%';