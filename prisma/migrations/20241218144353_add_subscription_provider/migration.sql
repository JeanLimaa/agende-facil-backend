/*
  Warnings:

  - You are about to drop the column `stripeSubscriptionId` on the `subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Subscription_stripeSubscriptionId_key` ON `subscription`;

-- AlterTable
ALTER TABLE `subscription` DROP COLUMN `stripeSubscriptionId`,
    ADD COLUMN `provider` ENUM('STRIPE', 'APPLE', 'GOOGLE') NULL,
    ADD COLUMN `subscriptionId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Subscription_subscriptionId_key` ON `Subscription`(`subscriptionId`);
