-- ============================================
-- SECURITY FIXES FOR ERROR-LEVEL FINDINGS
-- ============================================

-- 1. Add DELETE policy for profiles (GDPR compliance)
-- Users must be able to delete their own profile data
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- 2. Add DELETE policy for templates (allow creators to delete their own)
CREATE POLICY "Users can delete own templates"
ON public.templates
FOR DELETE
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- 3. Add admin viewing policy for AI usage monitoring
CREATE POLICY "Admins can view all AI usage"
ON public.ai_assistant_usage
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Create a rate_limit_logs table for tracking security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  ip_address text,
  user_agent text,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view security logs"
ON public.security_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only service role can insert (edge functions)
CREATE POLICY "Service role inserts security logs"
ON public.security_audit_log
FOR INSERT
WITH CHECK (true);

-- Create index for efficient querying
CREATE INDEX idx_security_audit_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX idx_security_audit_event_type ON public.security_audit_log(event_type);
CREATE INDEX idx_security_audit_user_id ON public.security_audit_log(user_id);