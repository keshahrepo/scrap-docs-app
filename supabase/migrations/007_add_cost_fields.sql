-- Add cost tracking fields to shipments
ALTER TABLE shipments
  ADD COLUMN purchase_cost_per_mt DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN other_costs DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN total_cost DECIMAL(14,2) DEFAULT 0;
