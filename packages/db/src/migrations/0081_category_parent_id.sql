ALTER TABLE `categories` ADD `parent_id` varchar(21);--> statement-breakpoint
CREATE INDEX `categories_parent_idx` ON `categories` (`parent_id`);
