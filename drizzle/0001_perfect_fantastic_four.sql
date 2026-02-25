CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`eventDate` timestamp NOT NULL,
	`eventTime` varchar(10),
	`location` text,
	`pixKey` varchar(255) NOT NULL,
	`pixKeyType` enum('celular','aleatoria','email','cpf') NOT NULL DEFAULT 'celular',
	`receiverName` varchar(255) NOT NULL,
	`whatsappContact` varchar(20),
	`whatsappMessage` text,
	`giftReservationLimit` enum('one_per_guest','one_per_gift','unlimited') NOT NULL DEFAULT 'one_per_guest',
	`giftReservationTimeout` int DEFAULT 120,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `giftSelections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`giftId` int NOT NULL,
	`guestId` int NOT NULL,
	`eventId` int NOT NULL,
	`selectedAt` timestamp NOT NULL DEFAULT (now()),
	`reservedUntil` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `giftSelections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` varchar(500),
	`suggestedValue` decimal(10,2) NOT NULL,
	`status` enum('available','reserved','completed','disabled') NOT NULL DEFAULT 'available',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`companions` int NOT NULL DEFAULT 0,
	`message` text,
	`dietaryRestrictions` text,
	`rsvpStatus` enum('confirmed','declined','pending') NOT NULL DEFAULT 'pending',
	`confirmedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`guestId` int NOT NULL,
	`giftSelectionId` int,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('awaiting_payment','payment_informed','confirmed','cancelled') NOT NULL DEFAULT 'awaiting_payment',
	`pixKey` varchar(255),
	`qrCode` text,
	`internalNotes` text,
	`confirmedAt` timestamp,
	`confirmedBy` int,
	`paymentInformedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
