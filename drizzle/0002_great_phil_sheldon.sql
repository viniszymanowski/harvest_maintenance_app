CREATE TABLE `app_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailDestinatario` varchar(320),
	`envioEmailAtivo` boolean NOT NULL DEFAULT false,
	`horarioEnvioEmail` varchar(5) NOT NULL DEFAULT '18:00',
	`whatsappNumero` varchar(20),
	`envioWhatsappAtivo` boolean NOT NULL DEFAULT false,
	`horarioEnvioWhatsapp` varchar(5) NOT NULL DEFAULT '18:00',
	`twilioAccountSid` text,
	`twilioAuthToken` text,
	`twilioWhatsappFrom` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_settings_id` PRIMARY KEY(`id`)
);
