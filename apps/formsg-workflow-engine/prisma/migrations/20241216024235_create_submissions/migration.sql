-- CreateTable
CREATE TABLE "submissions" (
    "id" SERIAL NOT NULL,
    "form_id" VARCHAR(255) NOT NULL,
    "submission_id" VARCHAR(255) NOT NULL,
    "form_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);
