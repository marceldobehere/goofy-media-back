PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_comments` (
	`uuid` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`postUuid` text NOT NULL,
	`replyCommentUuid` text,
	`text` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`signature` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`postUuid`) REFERENCES `posts`(`uuid`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`replyCommentUuid`) REFERENCES `comments`(`uuid`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_comments`("uuid", "userId", "postUuid", "replyCommentUuid", "text", "createdAt", "signature") SELECT "uuid", "userId", "postUuid", "replyCommentUuid", "text", "createdAt", "signature" FROM `comments`;--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
ALTER TABLE `__new_comments` RENAME TO `comments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;