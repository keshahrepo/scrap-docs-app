CREATE TABLE containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  container_number TEXT NOT NULL,
  seal_number TEXT,
  container_size TEXT DEFAULT '20',
  gross_weight_mt DECIMAL(10,3) NOT NULL,
  tare_weight_mt DECIMAL(10,3) NOT NULL,
  net_weight_mt DECIMAL(10,3) GENERATED ALWAYS AS (gross_weight_mt - tare_weight_mt) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(shipment_id, sequence_number)
);

ALTER TABLE containers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage containers on own shipments"
  ON containers FOR ALL
  USING (
    shipment_id IN (SELECT id FROM shipments WHERE user_id = auth.uid())
  );
