PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_userWebhookNotifs` (
	`userId` text NOT NULL,
	`webhookService` text NOT NULL,
	`webhookUrl` text NOT NULL,
	`webhookType` text NOT NULL,
	PRIMARY KEY(`userId`, `webhookType`),
	FOREIGN KEY (`userId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_userWebhookNotifs`("userId", "webhookService", "webhookUrl", "webhookType") SELECT "userId", "webhookService", "webhookUrl", "webhookType" FROM `userWebhookNotifs`;--> statement-breakpoint
DROP TABLE `userWebhookNotifs`;--> statement-breakpoint
ALTER TABLE `__new_userWebhookNotifs` RENAME TO `userWebhookNotifs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;