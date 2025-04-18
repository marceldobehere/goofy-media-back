CREATE TABLE `userWebhookNotifs` (
	`userId` text PRIMARY KEY NOT NULL,
	`webhookService` text NOT NULL,
	`webhookUrl` text NOT NULL,
	`webhookType` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `registeredUsers`(`userId`) ON UPDATE cascade ON DELETE cascade
);
