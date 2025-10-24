-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "instructor_id" TEXT;

-- AlterTable
ALTER TABLE "public"."ProductDetail" ADD COLUMN     "instructor_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductDetail" ADD CONSTRAINT "ProductDetail_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
