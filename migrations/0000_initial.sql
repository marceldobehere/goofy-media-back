CREATE TABLE `registeredUsers` (
	`userId` text PRIMARY KEY NOT NULL,
	`publicKey` text NOT NULL,
	`isAdministrator` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `registerCodes` (
	`code` text PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`userId` text,
	`usedAt` integer,
	`isAdministrator` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `encryptedStorage` (
	`userId` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`username` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`uuid` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`title` text NOT NULL,
	`text` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`signature` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`uuid` text NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`uuid`, `tag`),
	FOREIGN KEY (`uuid`) REFERENCES `posts`(`uuid`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `test` (
	`test` text PRIMARY KEY NOT NULL
);
