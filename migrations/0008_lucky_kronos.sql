CREATE TABLE `asset` (
	`id` integer PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`cloudflare_id` text NOT NULL,
	`url` text NOT NULL,
	`campaign_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `asset_cloudflare_id_unique` ON `asset` (`cloudflare_id`);