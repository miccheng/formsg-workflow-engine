import { Worker } from '@temporalio/worker';
import { AllActivities } from '@formsg-workflow-engine/temporal-workflows';

async function run() {
  const workers = await Promise.all([
    Worker.create({
      workflowsPath: require.resolve(
        '../../../libs/temporal-workflows/src/lib/all-workflows.js'
      ),
      activities: AllActivities,
      taskQueue: 'formsg-workflow-engine',
    }),
    Worker.create({
      workflowsPath: require.resolve(
        '../../../libs/temporal-workflows/src/lib/all-workflows.js'
      ),
      activities: AllActivities,
      taskQueue: 'collation-scheduler',
    }),
  ]);

  await Promise.all(workers.map((w) => w.run()));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
