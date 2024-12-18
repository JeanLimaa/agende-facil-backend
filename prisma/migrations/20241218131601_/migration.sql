/*
  Warnings:

  - You are about to alter the column `plan` on the `subscription` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `Enum(EnumId(5))`.
  - A unique constraint covering the columns `[companyId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `subscription` MODIFY `plan` ENUM('TRIAL', 'PRO') NOT NULL DEFAULT 'TRIAL';

-- CreateIndex
CREATE UNIQUE INDEX `Subscription_companyId_key` ON `Subscription`(`companyId`);
