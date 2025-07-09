/*
  Warnings:

  - You are about to drop the `CompanyWorkingHour` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmployeeWorkingHour` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `country` to the `company_addresses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CompanyWorkingHour" DROP CONSTRAINT "CompanyWorkingHour_companyId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeWorkingHour" DROP CONSTRAINT "EmployeeWorkingHour_employeeId_fkey";

-- AlterTable
ALTER TABLE "company_addresses" ADD COLUMN     "country" TEXT NOT NULL;

-- DropTable
DROP TABLE "CompanyWorkingHour";

-- DropTable
DROP TABLE "EmployeeWorkingHour";

-- CreateTable
CREATE TABLE "employee_working_hours" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "employee_working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_working_hours" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "company_working_hours_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "employee_working_hours" ADD CONSTRAINT "employee_working_hours_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_working_hours" ADD CONSTRAINT "company_working_hours_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
