-- Add minecraft_ign column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN minecraft_ign text;

-- Update the handle_new_user function to include minecraft_ign
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, minecraft_ign)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'minecraft_ign'
  );
  RETURN NEW;
END;
$$;