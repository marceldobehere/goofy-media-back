PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_publicUserInfo` (
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
	FOREIGN KEY (`pinnedPostUuid`) REFERENCES `posts`(`uuid`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_publicUserInfo`("userId", "displayName", "profileBio", "profilePronouns", "profileLinks", "profileCustomCSS", "profilePictureUrl", "profileBannerUrl", "pinnedPostUuid", "updatedAt", "signature") SELECT "userId", "displayName", "profileBio", "profilePronouns", "profileLinks", "profileCustomCSS", "profilePictureUrl", "profileBannerUrl", "pinnedPostUuid", "updatedAt", "signature" FROM `publicUserInfo`;--> statement-breakpoint
DROP TABLE `publicUserInfo`;--> statement-breakpoint
ALTER TABLE `__new_publicUserInfo` RENAME TO `publicUserInfo`;--> statement-breakpoint
PRAGMA foreign_keys=ON;