-- Drop the unique constraint on invoice_number since RLS hides other users' rows
-- causing false duplicates. Invoice numbers are user-managed anyway.
ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_invoice_number_key;
