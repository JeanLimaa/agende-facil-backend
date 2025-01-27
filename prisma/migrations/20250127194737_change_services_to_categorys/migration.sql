/*
  Warnings:

  - You are about to drop the `employeeservices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `employeeservices` DROP FOREIGN KEY `EmployeeServices_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employeeservices` DROP FOREIGN KEY `EmployeeServices_serviceId_fkey`;

-- DropTable
DROP TABLE `employeeservices`;

-- CreateTable
CREATE TABLE `EmployeeCategorys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,

    UNIQUE INDEX `EmployeeCategorys_employeeId_categoryId_key`(`employeeId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmployeeCategorys` ADD CONSTRAINT `EmployeeCategorys_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeCategorys` ADD CONSTRAINT `EmployeeCategorys_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
