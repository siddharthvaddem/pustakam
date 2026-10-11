CREATE TABLE `entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day` text NOT NULL,
	`started_at` integer NOT NULL,
	`text` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `entries_day_idx` ON `entries` (`day`);