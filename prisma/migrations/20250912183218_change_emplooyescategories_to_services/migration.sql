/*
  Warnings:

  - You are about to drop the `employee_categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "employee_categories" DROP CONSTRAINT "employee_categories_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "employee_categories" DROP CONSTRAINT "employee_categories_employeeId_fkey";

-- DropTable
DROP TABLE "employee_categories";

-- CreateTable
CREATE TABLE "employee_services" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "employee_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_working_hours" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "category_working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_services_employeeId_serviceId_key" ON "employee_services"("employeeId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "category_working_hours_categoryId_dayOfWeek_key" ON "category_working_hours"("categoryId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "employee_services" ADD CONSTRAINT "employee_services_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_services" ADD CONSTRAINT "employee_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_working_hours" ADD CONSTRAINT "category_working_hours_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
