/*
  Warnings:

  - The primary key for the `Affiliate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `AffiliatesCourses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CourseChapter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CourseChapterContent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CourseNote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CoursesCategories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EnrolledCourse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Instructor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrderLine` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrderPayment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Page` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProductDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[user_id]` on the table `Instructor` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Affiliate" DROP CONSTRAINT "Affiliate_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."AffiliatesCourses" DROP CONSTRAINT "AffiliatesCourses_affiliate_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."AffiliatesCourses" DROP CONSTRAINT "AffiliatesCourses_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_instructor_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CourseChapter" DROP CONSTRAINT "CourseChapter_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CourseChapterContent" DROP CONSTRAINT "CourseChapterContent_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CourseNote" DROP CONSTRAINT "CourseNote_course_content_detail_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CourseNote" DROP CONSTRAINT "CourseNote_enrolled_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CourseNote" DROP CONSTRAINT "CourseNote_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CoursesCategories" DROP CONSTRAINT "CoursesCategories_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CoursesCategories" DROP CONSTRAINT "CoursesCategories_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."EnrolledCourse" DROP CONSTRAINT "EnrolledCourse_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."EnrolledCourse" DROP CONSTRAINT "EnrolledCourse_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."EnrolledCourse" DROP CONSTRAINT "EnrolledCourse_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Instructor" DROP CONSTRAINT "Instructor_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderLine" DROP CONSTRAINT "OrderLine_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderLine" DROP CONSTRAINT "OrderLine_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderLine" DROP CONSTRAINT "OrderLine_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderPayment" DROP CONSTRAINT "OrderPayment_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductDetail" DROP CONSTRAINT "ProductDetail_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductDetail" DROP CONSTRAINT "ProductDetail_product_id_fkey";

-- AlterTable
ALTER TABLE "public"."Affiliate" DROP CONSTRAINT "Affiliate_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Affiliate_id_seq";

-- AlterTable
ALTER TABLE "public"."AffiliatesCourses" DROP CONSTRAINT "AffiliatesCourses_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "affiliate_id" SET DATA TYPE TEXT,
ALTER COLUMN "course_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AffiliatesCourses_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AffiliatesCourses_id_seq";

-- AlterTable
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "parent_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Category_id_seq";

-- AlterTable
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "instructor_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Course_id_seq";

-- AlterTable
ALTER TABLE "public"."CourseChapter" DROP CONSTRAINT "CourseChapter_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "course_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CourseChapter_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CourseChapter_id_seq";

-- AlterTable
ALTER TABLE "public"."CourseChapterContent" DROP CONSTRAINT "CourseChapterContent_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "chapter_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CourseChapterContent_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CourseChapterContent_id_seq";

-- AlterTable
ALTER TABLE "public"."CourseNote" DROP CONSTRAINT "CourseNote_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "enrolled_course_id" SET DATA TYPE TEXT,
ALTER COLUMN "course_content_detail_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CourseNote_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CourseNote_id_seq";

-- AlterTable
ALTER TABLE "public"."CoursesCategories" DROP CONSTRAINT "CoursesCategories_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "course_id" SET DATA TYPE TEXT,
ALTER COLUMN "category_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CoursesCategories_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CoursesCategories_id_seq";

-- AlterTable
ALTER TABLE "public"."EnrolledCourse" DROP CONSTRAINT "EnrolledCourse_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "bundle_id" SET DATA TYPE TEXT,
ALTER COLUMN "course_id" SET DATA TYPE TEXT,
ALTER COLUMN "order_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "EnrolledCourse_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EnrolledCourse_id_seq";

-- AlterTable
ALTER TABLE "public"."Instructor" DROP CONSTRAINT "Instructor_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Instructor_id_seq";

-- AlterTable
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Order_id_seq";

-- AlterTable
ALTER TABLE "public"."OrderLine" DROP CONSTRAINT "OrderLine_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "order_id" SET DATA TYPE TEXT,
ALTER COLUMN "product_id" SET DATA TYPE TEXT,
ALTER COLUMN "course_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrderLine_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "OrderLine_id_seq";

-- AlterTable
ALTER TABLE "public"."OrderPayment" DROP CONSTRAINT "OrderPayment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "order_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "OrderPayment_id_seq";

-- AlterTable
ALTER TABLE "public"."Page" DROP CONSTRAINT "Page_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Page_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Page_id_seq";

-- AlterTable
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Product_id_seq";

-- AlterTable
ALTER TABLE "public"."ProductDetail" DROP CONSTRAINT "ProductDetail_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "course_id" SET DATA TYPE TEXT,
ALTER COLUMN "product_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProductDetail_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProductDetail_id_seq";

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_user_id_key" ON "public"."Instructor"("user_id");

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
