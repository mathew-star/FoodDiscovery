-- unaccent() is STABLE (it reads the dictionary via search_path), so it cannot back an index.
-- This wrapper pins the dictionary and schema, which makes IMMUTABLE safe.
CREATE OR REPLACE FUNCTION public.f_unaccent(text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
  AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "branch_dishes_name_trgm" ON "branch_dishes" USING gin (public.f_unaccent(lower("name")) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "canonical_dishes_name_trgm" ON "canonical_dishes" USING gin (public.f_unaccent(lower("name")) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "canonical_dish_aliases_alias_trgm" ON "canonical_dish_aliases" USING gin (public.f_unaccent(lower("alias")) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "branches_name_trgm" ON "branches" USING gin (public.f_unaccent(lower("name")) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "localities_name_trgm" ON "localities" USING gin (public.f_unaccent(lower("name")) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cuisines_name_trgm" ON "cuisines" USING gin (public.f_unaccent(lower("name")) gin_trgm_ops);
