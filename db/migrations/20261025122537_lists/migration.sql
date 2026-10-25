CREATE TYPE "list_kind" AS ENUM('want_to_try', 'been_there', 'custom');--> statement-breakpoint
CREATE TYPE "list_visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TABLE "list_items" (
	"id" uuid PRIMARY KEY,
	"list_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"branch_dish_id" uuid,
	"note" text,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "list_items_note_length" CHECK (char_length("note") <= 280)
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"kind" "list_kind" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"visibility" "list_visibility" DEFAULT 'private'::"list_visibility" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lists_title_length" CHECK (char_length("title") between 1 and 80),
	CONSTRAINT "lists_description_length" CHECK (char_length("description") <= 280)
);
--> statement-breakpoint
CREATE INDEX "list_items_list_position_idx" ON "list_items" ("list_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "list_items_entity_key" ON "list_items" ("list_id","branch_id",coalesce("branch_dish_id", '00000000-0000-0000-0000-000000000000'::uuid));--> statement-breakpoint
CREATE INDEX "lists_user_idx" ON "lists" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lists_user_default_key" ON "lists" ("user_id","kind") WHERE "kind" <> 'custom';--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_list_id_lists_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_branch_dish_id_branch_dishes_id_fkey" FOREIGN KEY ("branch_dish_id") REFERENCES "branch_dishes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;