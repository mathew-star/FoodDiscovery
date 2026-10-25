CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"device_id" uuid NOT NULL,
	"user_id" uuid,
	"branch_id" uuid,
	"branch_dish_id" uuid,
	"props" jsonb DEFAULT '{}' NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "analytics_events_name_occurred_idx" ON "analytics_events" ("name","occurred_at");--> statement-breakpoint
CREATE INDEX "analytics_events_branch_occurred_idx" ON "analytics_events" ("branch_id","occurred_at");--> statement-breakpoint
CREATE INDEX "analytics_events_branch_dish_occurred_idx" ON "analytics_events" ("branch_dish_id","occurred_at");