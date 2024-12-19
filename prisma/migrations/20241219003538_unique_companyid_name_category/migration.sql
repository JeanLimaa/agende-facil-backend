/*
  Warnings:

  - A unique constraint covering the columns `[companyId,name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Category_companyId_name_key` ON `Category`(`companyId`, `name`);
