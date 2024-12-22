-- CreateTable
CREATE TABLE "sg_forms" (
    "id" SERIAL NOT NULL,
    "form_id" VARCHAR(255) NOT NULL,
    "form_secret" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sg_forms_pkey" PRIMARY KEY ("id")
);
