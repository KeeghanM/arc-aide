-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `arc` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`hook` text DEFAULT (NULL),
	`protagonist` text DEFAULT (NULL),
	`antagonist` text DEFAULT (NULL),
	`problem` text DEFAULT (NULL),
	`key` text DEFAULT (NULL),
	`outcome` text DEFAULT (NULL),
	`hook_text` text DEFAULT '',
	`protagonist_text` text DEFAULT '',
	`antagonist_text` text DEFAULT '',
	`problem_text` text DEFAULT '',
	`outcome_text` text DEFAULT '',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`campaign_id` integer NOT NULL,
	`parent_arc_id` integer,
	`notes` text,
	`notes_text` text DEFAULT '',
	`published` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `campaign_arcSlug_unique` ON `arc` (`campaign_id`,`slug`);--> statement-breakpoint
CREATE TABLE `arc_thing` (
	`arc_id` integer NOT NULL,
	`thing_id` integer NOT NULL,
	FOREIGN KEY (`thing_id`) REFERENCES `thing`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`arc_id`) REFERENCES `arc`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `arc_thing_unique` ON `arc_thing` (`arc_id`,`thing_id`);--> statement-breakpoint
CREATE TABLE `campaign` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_campaignSlug_unique` ON `campaign` (`user_id`,`slug`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `thing` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`type_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`description_text` text DEFAULT '',
	`campaign_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`type_id`) REFERENCES `thing_type`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `campaign_thingSlug_unique` ON `thing` (`campaign_id`,`slug`);--> statement-breakpoint
CREATE TABLE `thing_type` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`campaign_id` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`username` text,
	`display_username` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `search_vocabulary` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`term` text NOT NULL,
	`frequency` integer DEFAULT 1,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE INDEX `idx_search_vocabulary_term` ON `search_vocabulary` (`term`);--> statement-breakpoint
CREATE TABLE `asset` (
	`id` integer PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`cloudflare_id` text NOT NULL,
	`url` text NOT NULL,
	`campaign_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `asset_cloudflare_id_unique` ON `asset` (`cloudflare_id`);
*/