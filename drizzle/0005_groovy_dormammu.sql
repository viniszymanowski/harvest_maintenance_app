ALTER TABLE `machines` ADD `tipo` enum('Colheitadeira','Plataforma','Trator','Pulverizador') DEFAULT 'Colheitadeira';--> statement-breakpoint
ALTER TABLE `machines` ADD `modelo` varchar(100);--> statement-breakpoint
ALTER TABLE `machines` ADD `chassi` varchar(50);--> statement-breakpoint
ALTER TABLE `machines` ADD `ano` int;--> statement-breakpoint
ALTER TABLE `machines` ADD `fabricante` varchar(100);