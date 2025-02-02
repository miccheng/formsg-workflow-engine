-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "encrypted_content" JSONB,
ALTER COLUMN "form_data" DROP NOT NULL;
