-- Create store_followers table
CREATE TABLE IF NOT EXISTS public.store_followers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, store_id)
);

-- Ensure followers_count column exists
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0;

-- Function to increment store followers count
CREATE OR REPLACE FUNCTION increment_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.stores
  SET followers_count = followers_count + 1
  WHERE id = NEW.store_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement store followers count
CREATE OR REPLACE FUNCTION decrement_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.stores
  SET followers_count = GREATEST(followers_count - 1, 0)
  WHERE id = OLD.store_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for insertion
DROP TRIGGER IF EXISTS increment_followers_count_trigger ON public.store_followers;
CREATE TRIGGER increment_followers_count_trigger
  AFTER INSERT ON public.store_followers
  FOR EACH ROW
  EXECUTE FUNCTION increment_followers_count();

-- Trigger for deletion
DROP TRIGGER IF EXISTS decrement_followers_count_trigger ON public.store_followers;
CREATE TRIGGER decrement_followers_count_trigger
  AFTER DELETE ON public.store_followers
  FOR EACH ROW
  EXECUTE FUNCTION decrement_followers_count();
