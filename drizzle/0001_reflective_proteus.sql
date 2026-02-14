CREATE TABLE `daily_logs` (
	`id` varchar(36) NOT NULL,
	`data` date NOT NULL,
	`fazenda` text NOT NULL,
	`talhao` text NOT NULL,
	`maquinaId` varchar(10) NOT NULL,
	`operador` text NOT NULL,
	`saidaProgramada` time,
	`saidaReal` time,
	`chegadaLavoura` time,
	`hmMotorInicial` real,
	`hmMotorFinal` real,
	`hmTrilhaInicial` real,
	`hmTrilhaFinal` real,
	`prodH` real NOT NULL DEFAULT 0,
	`manH` real NOT NULL DEFAULT 0,
	`chuvaH` real NOT NULL DEFAULT 0,
	`deslocH` real NOT NULL DEFAULT 0,
	`esperaH` real NOT NULL DEFAULT 0,
	`abasteceu` boolean NOT NULL DEFAULT false,
	`areaHa` real,
	`observacoes` text,
	`horasMotorDia` real,
	`horasTrilhaDia` real,
	`atrasoMin` int,
	`divergente` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `machines` (
	`id` varchar(10) NOT NULL,
	`nome` varchar(100),
	`intervaloTrocaOleoHm` real NOT NULL DEFAULT 250,
	`intervaloRevisao50hHm` real NOT NULL DEFAULT 50,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `machines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance` (
	`id` varchar(36) NOT NULL,
	`data` date NOT NULL,
	`maquinaId` varchar(10) NOT NULL,
	`tipo` enum('preventiva','corretiva_leve','corretiva_pesada') NOT NULL,
	`hmMotorNoServico` real NOT NULL,
	`tempoParadoH` real NOT NULL,
	`trocaOleo` boolean NOT NULL DEFAULT false,
	`revisao50h` boolean NOT NULL DEFAULT false,
	`proximaTrocaOleoHm` real,
	`proximaRevisao50hHm` real,
	`observacao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `maintenance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_parts` (
	`id` varchar(36) NOT NULL,
	`maintenanceId` varchar(36) NOT NULL,
	`nomePeca` text NOT NULL,
	`qtde` real NOT NULL,
	`valorUnit` real,
	`valorTotal` real,
	CONSTRAINT `maintenance_parts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `daily_logs` ADD CONSTRAINT `daily_logs_maquinaId_machines_id_fk` FOREIGN KEY (`maquinaId`) REFERENCES `machines`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `maintenance` ADD CONSTRAINT `maintenance_maquinaId_machines_id_fk` FOREIGN KEY (`maquinaId`) REFERENCES `machines`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `maintenance_parts` ADD CONSTRAINT `maintenance_parts_maintenanceId_maintenance_id_fk` FOREIGN KEY (`maintenanceId`) REFERENCES `maintenance`(`id`) ON DELETE cascade ON UPDATE no action;