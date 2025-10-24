/*
  Warnings:

  - You are about to drop the column `instructor_id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `instructor_id` on the `ProductDetail` table. All the data in the column will be lost.
  - Made the column `course_id` on table `ProductDetail` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_instructor_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductDetail" DROP CONSTRAINT "ProductDetail_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductDetail" DROP CONSTRAINT "ProductDetail_instructor_id_fkey";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "instructor_id";

-- AlterTable
ALTER TABLE "public"."ProductDetail" DROP COLUMN "instructor_id",
ALTER COLUMN "course_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ProductDetail" ADD CONSTRAINT "ProductDetail_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
