CREATE TABLE `follows` (
	`userId` text NOT NULL,
	`followingUserId` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`signature` text NOT NULL,
	PRIMARY KEY(`userId`, `followingUserId`),
	FOREIGN KEY (`userId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`followingUserId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade
);
