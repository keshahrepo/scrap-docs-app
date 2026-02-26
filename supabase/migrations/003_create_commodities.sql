CREATE TABLE commodities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  hs_code TEXT NOT NULL DEFAULT '72042990',
  basel_no TEXT NOT NULL DEFAULT 'B-1010',
  packing_type TEXT DEFAULT 'LOOSE IN CONTAINER',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own commodities"
  ON commodities FOR ALL USING (auth.uid() = user_id);
