CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  bank_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  swift_code TEXT,
  bank_address TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sellers"
  ON sellers FOR ALL USING (auth.uid() = user_id);
