-- this is the exact sql file yenye inacreate table in supabase. 
--btw it hold no apparent use as the entire folder runs in supabase, even if deleted it won't affect anything.

CREATE TABLE public.mpesa_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  checkout_request_id TEXT NOT NULL UNIQUE,
  merchant_request_id TEXT,
  phone TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  result_code INTEGER,
  result_desc TEXT,
  mpesa_receipt_number TEXT,
  raw_callback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mpesa_payments_checkout ON public.mpesa_payments(checkout_request_id);
CREATE INDEX idx_mpesa_payments_user ON public.mpesa_payments(user_id);

ALTER TABLE public.mpesa_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
  ON public.mpesa_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Inserts and updates are handled by edge functions using service role,
-- so no INSERT/UPDATE policies for client roles.
