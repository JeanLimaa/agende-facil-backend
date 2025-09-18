/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,dayOfWeek]` on the table `employee_working_hours` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "employee_working_hours_employeeId_dayOfWeek_key" ON "employee_working_hours"("employeeId", "dayOfWeek");
