CREATE TYPE "alias_source" AS ENUM('typed', 'merge', 'owner', 'seed');--> statement-breakpoint
CREATE TYPE "review_task_kind" AS ENUM('new_dish', 'new_branch', 'dish_duplicate', 'claim', 'correction');--> statement-breakpoint
CREATE TYPE "review_task_state" AS ENUM('open', 'resolved');--> statement-breakpoint
CREATE TABLE "branch_dish_aliases" (
	"id" uuid PRIMARY KEY,
	"branch_dish_id" uuid NOT NULL,
	"raw_text" text NOT NULL,
	"normalized_text" text NOT NULL,
	"created_by" uuid,
	"submitted_price_paise" integer,
	"how" "alias_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_tasks" (
	"id" uuid PRIMARY KEY,
	"kind" "review_task_kind" NOT NULL,
	"entity_id" uuid NOT NULL,
	"branch_id" uuid,
	"priority" smallint DEFAULT 3 NOT NULL,
	"state" "review_task_state" DEFAULT 'open'::"review_task_state" NOT NULL,
	"resolution" text,
	"opened_by" uuid,
	"resolved_by" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branch_dishes" ADD COLUMN "normalized_name" text;--> statement-breakpoint
ALTER TABLE "branch_dishes" ADD COLUMN "fingerprint" text;--> statement-breakpoint
CREATE UNIQUE INDEX "branch_dish_aliases_dish_text_key" ON "branch_dish_aliases" ("branch_dish_id","normalized_text");--> statement-breakpoint
CREATE UNIQUE INDEX "branch_dishes_branch_fingerprint_key" ON "branch_dishes" ("branch_id","fingerprint") WHERE "status" in ('pending', 'active') and "fingerprint" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "review_tasks_open_key" ON "review_tasks" ("kind","entity_id") WHERE "state" = 'open';--> statement-breakpoint
CREATE INDEX "review_tasks_queue_idx" ON "review_tasks" ("state","priority","created_at");--> statement-breakpoint
ALTER TABLE "branch_dish_aliases" ADD CONSTRAINT "branch_dish_aliases_branch_dish_id_branch_dishes_id_fkey" FOREIGN KEY ("branch_dish_id") REFERENCES "branch_dishes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "branch_dish_aliases" ADD CONSTRAINT "branch_dish_aliases_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "review_tasks" ADD CONSTRAINT "review_tasks_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "review_tasks" ADD CONSTRAINT "review_tasks_opened_by_users_id_fkey" FOREIGN KEY ("opened_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "review_tasks" ADD CONSTRAINT "review_tasks_resolved_by_users_id_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL;