CREATE OR REPLACE FUNCTION next_invoice_number(prefix TEXT DEFAULT 'ARC')
RETURNS TEXT AS $$
DECLARE
  last_num INTEGER;
  next_num INTEGER;
BEGIN
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(invoice_number FROM LENGTH(prefix) + 1) AS INTEGER)),
    3620
  ) INTO last_num
  FROM shipments
  WHERE invoice_number LIKE prefix || '%';

  next_num := last_num + 1;
  RETURN prefix || next_num::TEXT;
END;
$$ LANGUAGE plpgsql;
