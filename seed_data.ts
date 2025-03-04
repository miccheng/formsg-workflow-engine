const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const testForm = await prisma.sGForms.upsert({
    where: { formId: '675d3e0bf7757f96a3e82d2d' },
    update: {},
    create: {
      formId: '675d3e0bf7757f96a3e82d2d',
      formSecret: `${process.env.FORM_SECRET_KEY}`,
    },
  });

  const testFormWithAttachments = await prisma.sGForms.upsert({
    where: { formId: '679e22730bad842cc4b76974' },
    update: {},
    create: {
      formId: '679e22730bad842cc4b76974',
      formSecret: `${process.env.FORM2_SECRET_KEY}`,
    },
  });

  const testFormForOCR = await prisma.sGForms.upsert({
    where: { formId: '67a708c9dcc3e09f3a3393f5' },
    update: {},
    create: {
      formId: '67a708c9dcc3e09f3a3393f5',
      formSecret: `${process.env.FORM3_SECRET_KEY}`,
    },
  });

  console.log({ testForm, testFormWithAttachments, testFormForOCR });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
