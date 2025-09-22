-- Clean up mock/demo Meta campaigns
DELETE FROM metrics WHERE campaign_id IN (
  SELECT id FROM campaigns WHERE name IN (
    'Summer Sale Campaign',
    'Brand Awareness Q1', 
    'Product Launch Campaign'
  )
);

DELETE FROM campaigns WHERE name IN (
  'Summer Sale Campaign',
  'Brand Awareness Q1',
  'Product Launch Campaign'
);