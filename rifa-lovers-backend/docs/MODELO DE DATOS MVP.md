-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.lucky_passes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  raffle_id uuid,
  user_id uuid,
  user_pack_id uuid,
  status USER-DEFINED DEFAULT 'active'::lucky_pass_status,
  is_winner boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  ticket_number integer,
  CONSTRAINT lucky_passes_pkey PRIMARY KEY (id),
  CONSTRAINT lucky_passes_raffle_id_fkey FOREIGN KEY (raffle_id) REFERENCES public.raffles(id),
  CONSTRAINT lucky_passes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT lucky_passes_user_pack_id_fkey FOREIGN KEY (user_pack_id) REFERENCES public.user_packs(id)
);
CREATE TABLE public.milestones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  raffle_id uuid,
  name character varying,
  required_packs integer CHECK (required_packs > 0),
  sort_order integer,
  is_unlocked boolean DEFAULT false,
  unlocked_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT milestones_pkey PRIMARY KEY (id),
  CONSTRAINT milestones_raffle_id_fkey FOREIGN KEY (raffle_id) REFERENCES public.raffles(id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.packs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying,
  price numeric,
  lucky_pass_quantity integer,
  is_featured boolean DEFAULT false,
  is_pre_sale boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT packs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  purchase_id uuid,
  provider character varying,
  provider_transaction_id character varying,
  amount numeric,
  status USER-DEFINED DEFAULT 'created'::payment_status,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT payment_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT payment_transactions_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id)
);
CREATE TABLE public.prize_winners (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  prize_id uuid,
  lucky_pass_id uuid UNIQUE,
  user_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT prize_winners_pkey PRIMARY KEY (id),
  CONSTRAINT prize_winners_prize_id_fkey FOREIGN KEY (prize_id) REFERENCES public.prizes(id),
  CONSTRAINT prize_winners_lucky_pass_id_fkey FOREIGN KEY (lucky_pass_id) REFERENCES public.lucky_passes(id),
  CONSTRAINT prize_winners_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.prizes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  raffle_id uuid,
  milestone_id uuid,
  type USER-DEFINED,
  name character varying,
  description text,
  value_estimated numeric,
  quantity integer DEFAULT 1,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT prizes_pkey PRIMARY KEY (id),
  CONSTRAINT prizes_raffle_id_fkey FOREIGN KEY (raffle_id) REFERENCES public.raffles(id),
  CONSTRAINT prizes_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.milestones(id)
);
CREATE TABLE public.purchases (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  raffle_id uuid,
  user_id uuid,
  total_amount numeric,
  status USER-DEFINED DEFAULT 'pending'::purchase_status,
  created_at timestamp without time zone DEFAULT now(),
  paid_at timestamp without time zone,
  CONSTRAINT purchases_pkey PRIMARY KEY (id),
  CONSTRAINT purchases_raffle_id_fkey FOREIGN KEY (raffle_id) REFERENCES public.raffles(id),
  CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.raffle_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  raffle_id uuid UNIQUE,
  packs_sold integer DEFAULT 0,
  revenue_total numeric,
  percentage_to_goal numeric,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT raffle_progress_pkey PRIMARY KEY (id),
  CONSTRAINT raffle_progress_raffle_id_fkey FOREIGN KEY (raffle_id) REFERENCES public.raffles(id)
);
CREATE TABLE public.raffles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  organization_id uuid,
  title character varying,
  description text,
  goal_packs integer DEFAULT 5000,
  status USER-DEFINED DEFAULT 'draft'::raffle_status,
  start_date timestamp without time zone,
  end_date timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT raffles_pkey PRIMARY KEY (id),
  CONSTRAINT raffles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.user_packs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  raffle_id uuid,
  pack_id uuid,
  purchase_id uuid,
  quantity integer DEFAULT 1,
  total_paid numeric,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_packs_pkey PRIMARY KEY (id),
  CONSTRAINT user_packs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_packs_raffle_id_fkey FOREIGN KEY (raffle_id) REFERENCES public.raffles(id),
  CONSTRAINT user_packs_pack_id_fkey FOREIGN KEY (pack_id) REFERENCES public.packs(id),
  CONSTRAINT user_packs_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  organization_id uuid,
  email character varying,
  first_name character varying,
  last_name character varying,
  role USER-DEFINED DEFAULT 'customer'::user_role,
  status USER-DEFINED DEFAULT 'active'::user_status,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  phone_number numeric NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);