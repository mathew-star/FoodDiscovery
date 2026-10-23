CREATE TYPE "diet" AS ENUM('veg', 'egg', 'nonveg');--> statement-breakpoint
CREATE TYPE "fact_field" AS ENUM('hours', 'price_range', 'phone', 'address', 'payment_modes', 'veg_only');--> statement-breakpoint
CREATE TYPE "fact_source" AS ENUM('seed', 'ops', 'community');--> statement-breakpoint
CREATE TYPE "branch_status" AS ENUM('active', 'temporarily_closed', 'permanently_closed');--> statement-breakpoint
CREATE TABLE "ranking_config" (
	"key" text PRIMARY KEY,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branch_dishes" (
	"id" uuid PRIMARY KEY,
	"branch_id" uuid NOT NULL,
	"canonical_dish_id" uuid,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"menu_section" text NOT NULL,
	"price_paise" integer,
	"diet" "diet" NOT NULL,
	"is_jain" boolean DEFAULT false NOT NULL,
	"is_signature" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"score" real,
	"loved_pct" real,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"weight_sum" real DEFAULT 0 NOT NULL,
	"loved_weight" real DEFAULT 0 NOT NULL,
	"good_weight" real DEFAULT 0 NOT NULL,
	"okay_weight" real DEFAULT 0 NOT NULL,
	"skip_weight" real DEFAULT 0 NOT NULL,
	"scored_at" timestamp with time zone,
	"last_rated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canonical_dish_aliases" (
	"id" uuid PRIMARY KEY,
	"canonical_dish_id" uuid NOT NULL,
	"alias" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canonical_dishes" (
	"id" uuid PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"category_id" uuid NOT NULL,
	"default_diet" "diet" NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dish_categories" (
	"id" uuid PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facts" (
	"id" uuid PRIMARY KEY,
	"branch_id" uuid NOT NULL,
	"field" "fact_field" NOT NULL,
	"value" jsonb NOT NULL,
	"source" "fact_source" NOT NULL,
	"verified_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" uuid PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
	"center" geography(Point,4326) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "localities" (
	"id" uuid PRIMARY KEY,
	"city_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"center" geography(Point,4326) NOT NULL,
	"is_launch" boolean DEFAULT false NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branch_cuisines" (
	"branch_id" uuid,
	"cuisine_id" uuid,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "branch_cuisines_pkey" PRIMARY KEY("branch_id","cuisine_id")
);
--> statement-breakpoint
CREATE TABLE "branch_hours" (
	"id" uuid PRIMARY KEY,
	"branch_id" uuid NOT NULL,
	"day_of_week" smallint NOT NULL,
	"opens_at" time NOT NULL,
	"closes_at" time NOT NULL,
	CONSTRAINT "branch_hours_day_check" CHECK ("day_of_week" between 0 and 6)
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY,
	"brand_id" uuid NOT NULL,
	"city_id" uuid NOT NULL,
	"locality_id" uuid NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"location" geography(Point,4326) NOT NULL,
	"phone" text,
	"price_band" smallint NOT NULL,
	"veg_only" boolean DEFAULT false NOT NULL,
	"payment_modes" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" "branch_status" DEFAULT 'active'::"branch_status" NOT NULL,
	"food_score" real,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branches_price_band_check" CHECK ("price_band" between 1 and 4)
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cuisines" (
	"id" uuid PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slug_redirects" (
	"id" uuid PRIMARY KEY,
	"entity_type" text NOT NULL,
	"from_slug" text NOT NULL,
	"to_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "branch_dishes_branch_slug_key" ON "branch_dishes" ("branch_id","slug");--> statement-breakpoint
CREATE INDEX "branch_dishes_canonical_score_idx" ON "branch_dishes" ("canonical_dish_id","score");--> statement-breakpoint
CREATE INDEX "branch_dishes_branch_score_idx" ON "branch_dishes" ("branch_id","score");--> statement-breakpoint
CREATE UNIQUE INDEX "canonical_dish_aliases_alias_key" ON "canonical_dish_aliases" (lower("alias"));--> statement-breakpoint
CREATE INDEX "canonical_dishes_category_idx" ON "canonical_dishes" ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "facts_branch_field_key" ON "facts" ("branch_id","field");--> statement-breakpoint
CREATE INDEX "facts_verified_idx" ON "facts" ("verified_at");--> statement-breakpoint
CREATE UNIQUE INDEX "localities_city_slug_key" ON "localities" ("city_id","slug");--> statement-breakpoint
CREATE INDEX "localities_center_gist" ON "localities" USING gist ("center");--> statement-breakpoint
CREATE INDEX "branch_cuisines_cuisine_idx" ON "branch_cuisines" ("cuisine_id");--> statement-breakpoint
CREATE INDEX "branch_hours_branch_idx" ON "branch_hours" ("branch_id");--> statement-breakpoint
CREATE INDEX "branches_location_gist" ON "branches" USING gist ("location");--> statement-breakpoint
CREATE INDEX "branches_locality_idx" ON "branches" ("locality_id");--> statement-breakpoint
CREATE INDEX "branches_brand_idx" ON "branches" ("brand_id");--> statement-breakpoint
CREATE UNIQUE INDEX "slug_redirects_entity_from_key" ON "slug_redirects" ("entity_type","from_slug");--> statement-breakpoint
ALTER TABLE "branch_dishes" ADD CONSTRAINT "branch_dishes_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "branch_dishes" ADD CONSTRAINT "branch_dishes_canonical_dish_id_canonical_dishes_id_fkey" FOREIGN KEY ("canonical_dish_id") REFERENCES "canonical_dishes"("id");--> statement-breakpoint
ALTER TABLE "canonical_dish_aliases" ADD CONSTRAINT "canonical_dish_aliases_bVflwSLzHCRQ_fkey" FOREIGN KEY ("canonical_dish_id") REFERENCES "canonical_dishes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "canonical_dishes" ADD CONSTRAINT "canonical_dishes_category_id_dish_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "dish_categories"("id");--> statement-breakpoint
ALTER TABLE "facts" ADD CONSTRAINT "facts_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "localities" ADD CONSTRAINT "localities_city_id_cities_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id");--> statement-breakpoint
ALTER TABLE "branch_cuisines" ADD CONSTRAINT "branch_cuisines_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "branch_cuisines" ADD CONSTRAINT "branch_cuisines_cuisine_id_cuisines_id_fkey" FOREIGN KEY ("cuisine_id") REFERENCES "cuisines"("id");--> statement-breakpoint
ALTER TABLE "branch_hours" ADD CONSTRAINT "branch_hours_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_brand_id_brands_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id");--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_city_id_cities_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id");--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_locality_id_localities_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "localities"("id");