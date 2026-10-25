CREATE TYPE "diet_preference" AS ENUM('veg', 'jain', 'egg', 'nonveg');--> statement-breakpoint
CREATE TYPE "member_role" AS ENUM('member', 'ops', 'admin');--> statement-breakpoint
CREATE TYPE "trust_level" AS ENUM('t0', 't1', 't2', 'founding');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL UNIQUE,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"diet" "diet_preference",
	"cuisines" text[] DEFAULT '{}'::text[] NOT NULL,
	"home_locality_id" uuid,
	"role" "member_role" DEFAULT 'member'::"member_role" NOT NULL,
	"trust_level" "trust_level" DEFAULT 't0'::"trust_level" NOT NULL,
	"adult_confirmed_at" timestamp with time zone,
	"onboarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_username_format" CHECK ("username" ~ '^[a-z0-9_]{3,20}$'),
	CONSTRAINT "profiles_bio_length" CHECK (char_length("bio") <= 160),
	CONSTRAINT "profiles_cuisines_max" CHECK (cardinality("cuisines") <= 5)
);
--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles" (lower("username"));--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_home_locality_id_localities_id_fkey" FOREIGN KEY ("home_locality_id") REFERENCES "localities"("id");