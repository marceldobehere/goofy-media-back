CREATE TABLE `likes` (
	`userId` text NOT NULL,
	`postUuid` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`signature` text NOT NULL,
	PRIMARY KEY(`userId`, `postUuid`),
	FOREIGN KEY (`userId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`postUuid`) REFERENCES `posts`(`uuid`) ON UPDATE cascade ON DELETE cascade
);
