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

  console.log({ testForm });
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
