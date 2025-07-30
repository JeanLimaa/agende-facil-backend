/*
  Warnings:

  - A unique constraint covering the columns `[companyId,dayOfWeek]` on the table `company_working_hours` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "company_working_hours_companyId_dayOfWeek_key" ON "company_working_hours"("companyId", "dayOfWeek");
