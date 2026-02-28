ALTER TABLE public.patreon_migration 
  ADD CONSTRAINT patreon_migration_patreon_user_id_key 
  UNIQUE (patreon_user_id);