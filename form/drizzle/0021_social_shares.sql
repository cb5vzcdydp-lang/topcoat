CREATE TABLE `social_posts_new` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`kind` text NOT NULL CHECK (`kind` IN ('text','workout','photo','share')),
	`body` text NOT NULL,
	`workout` text,
	`media_key` text,
	`media_type` text,
	`created` text NOT NULL,
	`audience` text DEFAULT 'friends' NOT NULL,
	`allowed_uids` text DEFAULT '[]' NOT NULL,
	`comments_open` integer DEFAULT 1 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
INSERT INTO `social_posts_new` (`id`,`author`,`kind`,`body`,`workout`,`media_key`,`media_type`,`created`,`audience`,`allowed_uids`,`comments_open`,`version`) SELECT `id`,`author`,`kind`,`body`,`workout`,`media_key`,`media_type`,`created`,`audience`,`allowed_uids`,`comments_open`,`version` FROM `social_posts`;
--> statement-breakpoint
DROP TABLE `social_posts`;
--> statement-breakpoint
ALTER TABLE `social_posts_new` RENAME TO `social_posts`;
--> statement-breakpoint
CREATE INDEX `social_posts_author_created` ON `social_posts` (`author`,`created`);
