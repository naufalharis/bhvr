/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `instructorId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `EnrolledCourse` table. All the data in the column will be lost.
  - You are about to drop the column `enrolledAt` on the `EnrolledCourse` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `EnrolledCourse` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `ProductDetail` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `ProductDetail` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `ProductDetail` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `ProductDetail` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `course_type` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instructor_id` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_id` to the `EnrolledCourse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `EnrolledCourse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_id` to the `ProductDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."CourseType" AS ENUM ('single', 'bundle');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('video', 'slide', 'download');

-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EnrolledCourse" DROP CONSTRAINT "EnrolledCourse_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EnrolledCourse" DROP CONSTRAINT "EnrolledCourse_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductDetail" DROP CONSTRAINT "ProductDetail_courseId_fkey";

-- DropIndex
DROP INDEX "public"."ProductDetail_courseId_key";

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "instructorId",
DROP COLUMN "price",
DROP COLUMN "status",
ADD COLUMN     "course_type" "public"."CourseType" NOT NULL,
ADD COLUMN     "cover" TEXT,
ADD COLUMN     "instructor_id" INTEGER NOT NULL,
ADD COLUMN     "overview" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."EnrolledCourse" DROP COLUMN "courseId",
DROP COLUMN "enrolledAt",
DROP COLUMN "userId",
ADD COLUMN     "bundle_id" INTEGER,
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD COLUMN     "enrolled_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "order" TEXT,
ADD COLUMN     "order_id" INTEGER,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProductDetail" DROP COLUMN "courseId",
DROP COLUMN "discount",
DROP COLUMN "stock",
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD COLUMN     "product_id" INTEGER,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "createdAt",
DROP COLUMN "name",
ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "birth_place" TEXT,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "mobile_number" TEXT,
ADD COLUMN     "username" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."CourseStatus";

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "public"."Affiliate" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "registered_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unique_code" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AffiliatesCourses" (
    "id" SERIAL NOT NULL,
    "affiliate_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "registered_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliatesCourses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Instructor" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "registered_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoursesCategories" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "CoursesCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "title" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseChapter" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "cover" TEXT,
    "sort_order" INTEGER,

    CONSTRAINT "CourseChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseChapterContent" (
    "id" SERIAL NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "cover" TEXT,
    "content_type" "public"."ContentType" NOT NULL,
    "sort_order" INTEGER,
    "path" TEXT,
    "original_file_name" TEXT,

    CONSTRAINT "CourseChapterContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseNote" (
    "id" SERIAL NOT NULL,
    "enrolled_course_id" INTEGER NOT NULL,
    "course_content_detail_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "CourseNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderLine" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "course_id" INTEGER,
    "status" TEXT NOT NULL,

    CONSTRAINT "OrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderPayment" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reference_number" TEXT,

    CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "cover" TEXT,
    "product_type" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Page" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Affiliate_unique_code_key" ON "public"."Affiliate"("unique_code");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "public"."Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "public"."Course"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."Affiliate" ADD CONSTRAINT "Affiliate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AffiliatesCourses" ADD CONSTRAINT "AffiliatesCourses_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "public"."Affiliate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AffiliatesCourses" ADD CONSTRAINT "AffiliatesCourses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Instructor" ADD CONSTRAINT "Instructor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoursesCategories" ADD CONSTRAINT "CoursesCategories_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoursesCategories" ADD CONSTRAINT "CoursesCategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseChapter" ADD CONSTRAINT "CourseChapter_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseChapterContent" ADD CONSTRAINT "CourseChapterContent_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."CourseChapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnrolledCourse" ADD CONSTRAINT "EnrolledCourse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnrolledCourse" ADD CONSTRAINT "EnrolledCourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnrolledCourse" ADD CONSTRAINT "EnrolledCourse_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseNote" ADD CONSTRAINT "CourseNote_enrolled_course_id_fkey" FOREIGN KEY ("enrolled_course_id") REFERENCES "public"."EnrolledCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseNote" ADD CONSTRAINT "CourseNote_course_content_detail_id_fkey" FOREIGN KEY ("course_content_detail_id") REFERENCES "public"."CourseChapterContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseNote" ADD CONSTRAINT "CourseNote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderLine" ADD CONSTRAINT "OrderLine_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderLine" ADD CONSTRAINT "OrderLine_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderLine" ADD CONSTRAINT "OrderLine_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderPayment" ADD CONSTRAINT "OrderPayment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductDetail" ADD CONSTRAINT "ProductDetail_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductDetail" ADD CONSTRAINT "ProductDetail_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
