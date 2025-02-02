-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'DECRYPTED', 'PROCESSED');

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING';
