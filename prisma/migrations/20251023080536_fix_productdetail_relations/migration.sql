-- DropForeignKey
ALTER TABLE "public"."ProductDetail" DROP CONSTRAINT "ProductDetail_course_id_fkey";

-- AlterTable
ALTER TABLE "public"."ProductDetail" ALTER COLUMN "course_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ProductDetail" ADD CONSTRAINT "ProductDetail_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
