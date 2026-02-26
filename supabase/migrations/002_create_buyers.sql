CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  gst_no TEXT,
  pan_no TEXT,
  ie_code TEXT,
  email TEXT,
  phone TEXT,
  contact_person TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own buyers"
  ON buyers FOR ALL USING (auth.uid() = user_id);
