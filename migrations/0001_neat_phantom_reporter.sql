CREATE TABLE `arc_arc` (
	`id` integer PRIMARY KEY NOT NULL,
	`first_arc_id` integer NOT NULL,
	`second_arc_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`first_arc_id`) REFERENCES `arc`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`second_arc_id`) REFERENCES `arc`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "first_arc_less_than_second" CHECK(first_arc_id < second_arc_id)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `arc_arc_unique` ON `arc_arc` (`first_arc_id`,`second_arc_id`);--> statement-breakpoint
CREATE TABLE `thing_thing` (
	`id` integer PRIMARY KEY NOT NULL,
	`first_thing_id` integer NOT NULL,
	`second_thing_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`first_thing_id`) REFERENCES `thing`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`second_thing_id`) REFERENCES `thing`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "first_thing_less_than_second" CHECK(first_thing_id < second_thing_id)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `thing_thing_unique` ON `thing_thing` (`first_thing_id`,`second_thing_id`);--> statement-breakpoint
DROP INDEX "campaign_arcSlug_unique";--> statement-breakpoint
DROP INDEX "arc_arc_unique";--> statement-breakpoint
DROP INDEX "arc_thing_unique";--> statement-breakpoint
DROP INDEX "asset_cloudflare_id_unique";--> statement-breakpoint
DROP INDEX "user_campaignSlug_unique";--> statement-breakpoint
DROP INDEX "idx_search_vocabulary_term";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "campaign_thingSlug_unique";--> statement-breakpoint
DROP INDEX "thing_thing_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_username_unique";--> statement-breakpoint
ALTER TABLE `arc` ALTER COLUMN "hook" TO "hook" text;--> statement-breakpoint
CREATE UNIQUE INDEX `campaign_arcSlug_unique` ON `arc` (`campaign_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `arc_thing_unique` ON `arc_thing` (`arc_id`,`thing_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `asset_cloudflare_id_unique` ON `asset` (`cloudflare_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_campaignSlug_unique` ON `campaign` (`user_id`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_search_vocabulary_term` ON `search_vocabulary` (`term`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `campaign_thingSlug_unique` ON `thing` (`campaign_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
ALTER TABLE `arc` ALTER COLUMN "protagonist" TO "protagonist" text;--> statement-breakpoint
ALTER TABLE `arc` ALTER COLUMN "antagonist" TO "antagonist" text;--> statement-breakpoint
ALTER TABLE `arc` ALTER COLUMN "problem" TO "problem" text;--> statement-breakpoint
ALTER TABLE `arc` ALTER COLUMN "key" TO "key" text;--> statement-breakpoint
ALTER TABLE `arc` ALTER COLUMN "outcome" TO "outcome" text;--> statement-breakpoint
ALTER TABLE `arc` ADD `key_text` text DEFAULT '';