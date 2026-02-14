CREATE TABLE `maintenance_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`maquinaId` varchar(10) NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`intervaloHoras` real NOT NULL,
	`alertaAntecipadoHoras` real NOT NULL DEFAULT 10,
	`ultimaManutencaoHm` real NOT NULL DEFAULT 0,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `maintenance_plans` ADD CONSTRAINT `maintenance_plans_maquinaId_machines_id_fk` FOREIGN KEY (`maquinaId`) REFERENCES `machines`(`id`) ON DELETE no action ON UPDATE no action;