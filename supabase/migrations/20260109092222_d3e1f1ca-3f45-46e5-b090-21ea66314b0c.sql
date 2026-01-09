-- Fix RLS policies to prevent anonymous access

-- 1. Fix profiles table - ensure only authenticated users can read
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid() OR is_admin_or_manager(auth.uid()));

-- 2. Fix orders table - ensure only authenticated users can read their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" 
ON public.orders 
FOR SELECT 
USING (user_id = auth.uid() OR is_admin_or_manager(auth.uid()));

-- 3. Add SELECT policy for rcon_servers - admin only
DROP POLICY IF EXISTS "Admins can view rcon_servers" ON public.rcon_servers;
CREATE POLICY "Admins can view rcon_servers" 
ON public.rcon_servers 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));

-- 4. Add SELECT policy for delivery_commands - admin only
DROP POLICY IF EXISTS "Admins can view delivery_commands" ON public.delivery_commands;
CREATE POLICY "Admins can view delivery_commands" 
ON public.delivery_commands 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));

-- 5. Add SELECT policy for delivery_queue - admin only
DROP POLICY IF EXISTS "Admins can view delivery_queue" ON public.delivery_queue;
CREATE POLICY "Admins can view delivery_queue" 
ON public.delivery_queue 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));

-- 6. Fix delivery_logs SELECT policy - already has one but needs to be admin only
DROP POLICY IF EXISTS "Admins can view delivery_logs" ON public.delivery_logs;
CREATE POLICY "Admins can view delivery_logs" 
ON public.delivery_logs 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));

-- 7. Add SELECT policy for product_rcon_servers - admin only
DROP POLICY IF EXISTS "Admins can view product_rcon_servers" ON public.product_rcon_servers;
CREATE POLICY "Admins can view product_rcon_servers" 
ON public.product_rcon_servers 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));

-- 8. Fix user_roles SELECT policy - already admin only but double check
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR user_id = auth.uid());