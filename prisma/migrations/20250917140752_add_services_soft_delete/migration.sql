/*
  Warnings:

  - You are about to drop the column `isClosed` on the `employee_working_hours` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "employee_working_hours" DROP COLUMN "isClosed";

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
