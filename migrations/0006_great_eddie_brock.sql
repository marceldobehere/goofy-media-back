CREATE TABLE `publicUserInfo` (
	`userId` text PRIMARY KEY NOT NULL,
	`displayName` text NOT NULL,
	`profileBio` text NOT NULL,
	`profilePronouns` text NOT NULL,
	`profileLinks` text NOT NULL,
	`profileCustomCSS` text NOT NULL,
	`profilePictureUrl` text,
	`profileBannerUrl` text,
	`pinnedPostUuid` text,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`signature` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`pinnedPostUuid`) REFERENCES `posts`(`uuid`) ON UPDATE cascade ON DELETE cascade
);
