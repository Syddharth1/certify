-- Create table to track AI assistant usage
CREATE TABLE IF NOT EXISTS public.ai_assistant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_ai_usage_user_time ON public.ai_assistant_usage(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_assistant_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own usage
CREATE POLICY "Users can view their own AI usage"
  ON public.ai_assistant_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert usage records
CREATE POLICY "Service role can insert usage records"
  ON public.ai_assistant_usage
  FOR INSERT
  WITH CHECK (true);