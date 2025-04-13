CREATE TABLE `notifications` (
	`uuid` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`notificationType` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`isRead` integer DEFAULT false NOT NULL,
	`otherUserId` text,
	`postUuid` text,
	`commentUuid` text,
	FOREIGN KEY (`userId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`otherUserId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`postUuid`) REFERENCES `posts`(`uuid`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`commentUuid`) REFERENCES `comments`(`uuid`) ON UPDATE cascade ON DELETE cascade
);
