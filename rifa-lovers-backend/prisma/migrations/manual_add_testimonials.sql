-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.testimonials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id   UUID NOT NULL REFERENCES public.raffles(id),
  user_id     UUID NOT NULL REFERENCES public.users(id),
  lucky_pass_id UUID NOT NULL UNIQUE REFERENCES public.lucky_passes(id),
  text        TEXT NOT NULL,
  rating      INTEGER NOT NULL DEFAULT 5,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_raffle ON public.testimonials(raffle_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_user ON public.testimonials(user_id);
