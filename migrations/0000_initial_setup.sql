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
	`hook` text,
	`protagonist` text,
	`antagonist` text,
	`problem` text,
	`key` text,
	`outcome` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`campaign_id` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `campaign_arcSlug_unique` ON `arc` (`campaign_id`,`slug`);--> statement-breakpoint
CREATE TABLE `arc_thing` (
	`arc_id` integer NOT NULL,
	`thing_id` integer NOT NULL,
	FOREIGN KEY (`arc_id`) REFERENCES `arc`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`thing_id`) REFERENCES `thing`(`id`) ON UPDATE no action ON DELETE cascade
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
	`user_id` text NOT NULL
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
	`slug` text,
	`type_id` integer NOT NULL,
	`description` text,
	`campaign_id` integer NOT NULL,
	FOREIGN KEY (`type_id`) REFERENCES `thing_type`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `campaign_thingSlug_unique` ON `thing` (`campaign_id`,`slug`);--> statement-breakpoint
CREATE TABLE `thing_type` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`campaign_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
