DROP INDEX "campaign_arcSlug_unique";--> statement-breakpoint
DROP INDEX "arc_thing_unique";--> statement-breakpoint
DROP INDEX "user_campaignSlug_unique";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "campaign_thingSlug_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
CREATE UNIQUE INDEX `campaign_arcSlug_unique` ON `arc` (`campaign_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `arc_thing_unique` ON `arc_thing` (`arc_id`,`thing_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_campaignSlug_unique` ON `campaign` (`user_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `campaign_thingSlug_unique` ON `thing` (`campaign_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `arc` ALTER COLUMN "hook" TO "hook" text DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `arc` ALTER COLUMN "protagonist" TO "protagonist" text DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `arc` ALTER COLUMN "antagonist" TO "antagonist" text DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `arc` ALTER COLUMN "problem" TO "problem" text DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `arc` ALTER COLUMN "key" TO "key" text DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `arc` ALTER COLUMN "outcome" TO "outcome" text DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `campaign` ALTER COLUMN "description" TO "description" text DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `thing` ALTER COLUMN "description" TO "description" text DEFAULT NULL;