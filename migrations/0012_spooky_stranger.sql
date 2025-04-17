PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_notifications` (
	`uuid` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`notificationType` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`isRead` integer DEFAULT false NOT NULL,
	`otherUserId` text,
	`postUuid` text,
	`commentUuid` text,
	`commentResponseUuid` text,
	FOREIGN KEY (`userId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`otherUserId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`postUuid`) REFERENCES `posts`(`uuid`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`commentUuid`) REFERENCES `comments`(`uuid`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`commentResponseUuid`) REFERENCES `comments`(`uuid`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_notifications`("uuid", "userId", "notificationType", "createdAt", "isRead", "otherUserId", "postUuid", "commentUuid", "commentResponseUuid") SELECT "uuid", "userId", "notificationType", "createdAt", "isRead", "otherUserId", "postUuid", "commentUuid", "commentResponseUuid" FROM `notifications`;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
ALTER TABLE `__new_notifications` RENAME TO `notifications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;