CREATE TABLE `fazendas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`localizacao` varchar(200),
	`areaTotal` real,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fazendas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operadores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`cpf` varchar(14),
	`telefone` varchar(20),
	`email` varchar(100),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operadores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `talhoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fazendaId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`areaHa` real NOT NULL,
	`cultura` varchar(50),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `talhoes_id` PRIMARY KEY(`id`)
);
