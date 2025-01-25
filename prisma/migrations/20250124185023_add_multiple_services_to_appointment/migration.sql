/*
  Warnings:

  - You are about to drop the column `serviceId` on the `appointment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `appointment` DROP FOREIGN KEY `Appointment_serviceId_fkey`;

-- AlterTable
ALTER TABLE `appointment` DROP COLUMN `serviceId`;

-- CreateTable
CREATE TABLE `AppointmentService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointmentId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,

    UNIQUE INDEX `AppointmentService_appointmentId_serviceId_key`(`appointmentId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AppointmentService` ADD CONSTRAINT `AppointmentService_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppointmentService` ADD CONSTRAINT `AppointmentService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
