ALTER TABLE "branches" ADD COLUMN "tags" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
CREATE INDEX "branches_tags_gin" ON "branches" USING gin ("tags");