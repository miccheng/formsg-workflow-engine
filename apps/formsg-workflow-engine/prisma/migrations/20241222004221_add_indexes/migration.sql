/*
  Warnings:

  - A unique constraint covering the columns `[form_id]` on the table `sg_forms` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "sg_forms_form_id_key" ON "sg_forms"("form_id");

-- CreateIndex
CREATE INDEX "sg_forms_form_id_idx" ON "sg_forms"("form_id");

-- CreateIndex
CREATE INDEX "submissions_form_id_idx" ON "submissions"("form_id");
