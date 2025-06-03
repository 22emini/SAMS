CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`present` boolean DEFAULT false,
	`day` int NOT NULL,
	`date` varchar(20) NOT NULL,
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`grade` varchar(10) NOT NULL,
	CONSTRAINT `grades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(30) NOT NULL,
	`grade` varchar(10) NOT NULL,
	`address` varchar(50),
	`contact` varchar(11),
	`clerk_user_id` varchar(256),
	`face_descriptor` text,
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
