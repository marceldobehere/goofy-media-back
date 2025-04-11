CREATE TABLE `comments` (
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
