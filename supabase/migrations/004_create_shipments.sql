CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES sellers(id),
  buyer_id UUID NOT NULL REFERENCES buyers(id),
  commodity_id UUID NOT NULL REFERENCES commodities(id),

  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,

  bl_number TEXT,
  vessel_name TEXT,
  voyage_number TEXT,
  port_of_loading TEXT DEFAULT 'NORFOLK, VA',
  port_of_discharge TEXT,
  final_destination TEXT,
  place_of_receipt TEXT,
  sales_contract_ref TEXT,

  rate_per_mt DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  incoterms TEXT DEFAULT 'CIF',
  incoterms_destination TEXT,
  advance_paid DECIMAL(12,2) DEFAULT 0,
  freight_per_container DECIMAL(10,2),
  payment_terms TEXT,

  total_containers INTEGER DEFAULT 0,
  total_net_weight DECIMAL(12,3) DEFAULT 0,
  total_gross_weight DECIMAL(12,3) DEFAULT 0,
  total_tare_weight DECIMAL(12,3) DEFAULT 0,
  total_amount DECIMAL(14,2) DEFAULT 0,
  balance_due DECIMAL(14,2) DEFAULT 0,

  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'shipped')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shipments"
  ON shipments FOR ALL USING (auth.uid() = user_id);
