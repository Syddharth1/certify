-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can verify certificates" ON public.certificates;

-- Create a secure function for public certificate verification
-- This only returns minimal necessary data and requires a verification_id lookup
CREATE OR REPLACE FUNCTION public.verify_certificate_by_id(verification_code TEXT)
RETURNS TABLE (
  verification_id TEXT,
  title TEXT,
  recipient_name TEXT,
  issued_date DATE,
  blockchain_status TEXT,
  blockchain_hash TEXT,
  blockchain_timestamp TIMESTAMPTZ,
  blockchain_tx_id TEXT,
  certificate_data JSONB
)
SECURITY DEFINER
SET search_path = ''
LANGUAGE SQL
AS $$
  SELECT 
    c.verification_id,
    c.title,
    c.recipient_name,
    c.issued_date,
    c.blockchain_status,
    c.blockchain_hash,
    c.blockchain_timestamp,
    c.blockchain_tx_id,
    c.certificate_data
  FROM public.certificates c
  WHERE c.verification_id = verification_code
  LIMIT 1;
$$;

-- Grant execute permission to anonymous users (for public verification)
GRANT EXECUTE ON FUNCTION public.verify_certificate_by_id(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_certificate_by_id(TEXT) TO authenticated;