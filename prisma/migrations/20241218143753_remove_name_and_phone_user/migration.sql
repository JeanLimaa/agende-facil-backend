/*
  Warnings:

  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `employee` ADD COLUMN `phone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `name`,
    DROP COLUMN `phone`;
