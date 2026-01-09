-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'manager')
  )
$$;

-- RLS policy for user_roles (only admins can view/modify)
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Profiles are created via trigger" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create game_mode enum
CREATE TYPE public.game_mode AS ENUM ('survival', 'lifesteal');

-- Create product_type enum
CREATE TYPE public.product_type AS ENUM ('rank', 'item', 'crate', 'bundle');

-- Create rcon_servers table
CREATE TABLE public.rcon_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mode game_mode NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 25575,
  priority INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rcon_servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rcon_servers" ON public.rcon_servers
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type product_type NOT NULL,
  mode game_mode NOT NULL,
  price_inr DECIMAL(10, 2) NOT NULL,
  original_price_inr DECIMAL(10, 2),
  lifetime BOOLEAN NOT NULL DEFAULT true,
  duration_days INTEGER,
  delivery_enabled BOOLEAN NOT NULL DEFAULT true,
  discord_role_id TEXT,
  image_url TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- Junction table for product-rcon server relationship
CREATE TABLE public.product_rcon_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rcon_server_id UUID NOT NULL REFERENCES public.rcon_servers(id) ON DELETE CASCADE,
  UNIQUE (product_id, rcon_server_id)
);

ALTER TABLE public.product_rcon_servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage product_rcon_servers" ON public.product_rcon_servers
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- Create delivery_commands table
CREATE TABLE public.delivery_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  command_text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  delay_ms INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage delivery_commands" ON public.delivery_commands
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- Create payment_status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create delivery_status enum  
CREATE TYPE public.delivery_status AS ENUM ('pending', 'queued', 'processing', 'delivered', 'failed');

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  minecraft_ign TEXT NOT NULL,
  discord_id TEXT,
  email TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  amount_inr DECIMAL(10, 2) NOT NULL,
  coupon_code TEXT,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_provider TEXT,
  payment_id TEXT,
  delivery_status delivery_status NOT NULL DEFAULT 'pending',
  delivery_log JSONB DEFAULT '[]'::jsonb,
  is_gift BOOLEAN NOT NULL DEFAULT false,
  gift_recipient_ign TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

-- Admins can manage all orders
CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- Allow inserting orders (for checkout)
CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create delivery_queue table
CREATE TABLE public.delivery_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  minecraft_ign TEXT NOT NULL,
  status delivery_status NOT NULL DEFAULT 'queued',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage delivery_queue" ON public.delivery_queue
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- Create player_status table
CREATE TABLE public.player_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minecraft_ign TEXT NOT NULL UNIQUE,
  server_name TEXT,
  online BOOLEAN NOT NULL DEFAULT false,
  last_join_at TIMESTAMP WITH TIME ZONE,
  last_leave_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.player_status ENABLE ROW LEVEL SECURITY;

-- Player status is publicly readable
CREATE POLICY "Anyone can view player status" ON public.player_status
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage player_status" ON public.player_status
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- Create delivery_logs table
CREATE TABLE public.delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rcon_server_id UUID REFERENCES public.rcon_servers(id) ON DELETE SET NULL,
  command_text TEXT,
  status TEXT NOT NULL,
  execution_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view delivery_logs" ON public.delivery_logs
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "System can insert delivery_logs" ON public.delivery_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rcon_servers_updated_at
  BEFORE UPDATE ON public.rcon_servers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_status_updated_at
  BEFORE UPDATE ON public.player_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_minecraft_ign ON public.orders(minecraft_ign);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_delivery_status ON public.orders(delivery_status);
CREATE INDEX idx_products_mode ON public.products(mode);
CREATE INDEX idx_products_type ON public.products(type);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_delivery_queue_status ON public.delivery_queue(status);
CREATE INDEX idx_delivery_queue_next_attempt ON public.delivery_queue(next_attempt_at);
CREATE INDEX idx_player_status_online ON public.player_status(online);
CREATE INDEX idx_delivery_commands_product_id ON public.delivery_commands(product_id);