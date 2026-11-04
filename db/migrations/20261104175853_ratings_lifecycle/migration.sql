CREATE TYPE "dish_source" AS ENUM('seed', 'community', 'owner', 'ops');--> statement-breakpoint
CREATE TYPE "dish_status" AS ENUM('pending', 'active', 'rejected', 'merged', 'archived');--> statement-breakpoint
CREATE TYPE "branch_format" AS ENUM('restaurant', 'cafe', 'stall', 'bakery', 'cloud_kitchen', 'other');--> statement-breakpoint
CREATE TYPE "branch_listing" AS ENUM('provisional', 'listed', 'rejected', 'merged');--> statement-breakpoint
CREATE TYPE "aspect_value" AS ENUM('good', 'okay', 'poor');--> statement-breakpoint
CREATE TYPE "disclosure" AS ENUM('none', 'hosted', 'paid', 'works_here');--> statement-breakpoint
CREATE TYPE "sentiment" AS ENUM('loved', 'good', 'okay', 'skip');--> statement-breakpoint
CREATE TABLE "branch_aspect_ratings" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"value" "aspect_value",
	"service" "aspect_value",
	"ambience" "aspect_value",
	"would_return" boolean,
	"is_current" boolean DEFAULT true NOT NULL,
	"disclosure" "disclosure" DEFAULT 'none'::"disclosure" NOT NULL,
	"trust_at_time" "trust_level" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_affiliations" (
	"user_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dish_ratings" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"branch_dish_id" uuid NOT NULL,
	"sentiment" "sentiment" NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"disclosure" "disclosure" DEFAULT 'none'::"disclosure" NOT NULL,
	"suspect" boolean DEFAULT false NOT NULL,
	"trust_at_time" "trust_level" NOT NULL,
	"post_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branch_dishes" ADD COLUMN "status" "dish_status" DEFAULT 'active'::"dish_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "branch_dishes" ADD COLUMN "source" "dish_source" DEFAULT 'seed'::"dish_source" NOT NULL;--> statement-breakpoint
ALTER TABLE "branch_dishes" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "branch_dishes" ADD COLUMN "merged_into_id" uuid;--> statement-breakpoint
ALTER TABLE "branch_dishes" ADD COLUMN "owner_managed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "listing" "branch_listing" DEFAULT 'listed'::"branch_listing" NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "format" "branch_format" DEFAULT 'restaurant'::"branch_format" NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "merged_into_id" uuid;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "value_score" real;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "service_score" real;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "ambience_score" real;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "would_return_pct" real;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "aspect_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "branch_dishes_status_idx" ON "branch_dishes" ("status");--> statement-breakpoint
CREATE INDEX "branches_listing_idx" ON "branches" ("listing");--> statement-breakpoint
CREATE UNIQUE INDEX "branch_aspect_ratings_current_key" ON "branch_aspect_ratings" ("user_id","branch_id") WHERE "is_current";--> statement-breakpoint
CREATE INDEX "branch_aspect_ratings_branch_current_idx" ON "branch_aspect_ratings" ("branch_id") WHERE "is_current";--> statement-breakpoint
CREATE UNIQUE INDEX "brand_affiliations_key" ON "brand_affiliations" ("user_id","brand_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dish_ratings_current_key" ON "dish_ratings" ("user_id","branch_dish_id") WHERE "is_current";--> statement-breakpoint
CREATE INDEX "dish_ratings_dish_current_idx" ON "dish_ratings" ("branch_dish_id") WHERE "is_current";--> statement-breakpoint
CREATE INDEX "dish_ratings_user_created_idx" ON "dish_ratings" ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "branch_dishes" ADD CONSTRAINT "branch_dishes_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "branch_dishes" ADD CONSTRAINT "branch_dishes_merged_into_id_branch_dishes_id_fkey" FOREIGN KEY ("merged_into_id") REFERENCES "branch_dishes"("id");--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_merged_into_id_branches_id_fkey" FOREIGN KEY ("merged_into_id") REFERENCES "branches"("id");--> statement-breakpoint
ALTER TABLE "branch_aspect_ratings" ADD CONSTRAINT "branch_aspect_ratings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "branch_aspect_ratings" ADD CONSTRAINT "branch_aspect_ratings_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "brand_affiliations" ADD CONSTRAINT "brand_affiliations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "brand_affiliations" ADD CONSTRAINT "brand_affiliations_brand_id_brands_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "dish_ratings" ADD CONSTRAINT "dish_ratings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "dish_ratings" ADD CONSTRAINT "dish_ratings_branch_dish_id_branch_dishes_id_fkey" FOREIGN KEY ("branch_dish_id") REFERENCES "branch_dishes"("id") ON DELETE CASCADE;