/*
  Warnings:

  - Added the required column `companyId` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Category_name_key` ON `category`;

-- AlterTable
ALTER TABLE `category` ADD COLUMN `companyId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
