/*
  Warnings:

  - A unique constraint covering the columns `[link]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `link` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `company` ADD COLUMN `link` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Company_link_key` ON `Company`(`link`);
