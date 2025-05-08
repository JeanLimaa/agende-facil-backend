/*
  Warnings:

  - Added the required column `companyId` to the `GuestClient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `guestclient` ADD COLUMN `companyId` INTEGER NOT NULL,
    MODIFY `email` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `GuestClient` ADD CONSTRAINT `GuestClient_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
