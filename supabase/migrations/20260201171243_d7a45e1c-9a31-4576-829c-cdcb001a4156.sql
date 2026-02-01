-- Drop the verify_certificate_by_id function (will recreate without blockchain fields)
DROP FUNCTION IF EXISTS public.verify_certificate_by_id(text);

-- Recreate the function without blockchain fields
CREATE OR REPLACE FUNCTION public.verify_certificate_by_id(verification_code text)
RETURNS TABLE(
  verification_id text,
  title text,
  recipient_name text,
  issued_date date,
  certificate_data jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    c.verification_id,
    c.title,
    c.recipient_name,
    c.issued_date,
    c.certificate_data
  FROM public.certificates c
  WHERE c.verification_id = verification_code
  LIMIT 1;
$$;

-- Drop blockchain columns from certificates table
ALTER TABLE public.certificates 
DROP COLUMN IF EXISTS blockchain_hash,
DROP COLUMN IF EXISTS blockchain_proof,
DROP COLUMN IF EXISTS blockchain_status,
DROP COLUMN IF EXISTS blockchain_timestamp,
DROP COLUMN IF EXISTS blockchain_tx_id;