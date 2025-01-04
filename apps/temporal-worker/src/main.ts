import { Worker, NativeConnection } from '@temporalio/worker';
import { AllActivities } from '@formsg-workflow-engine/temporal-workflows';

async function run() {
  const connectionOptions = {
    address: process.env.TEMPORAL_HOST || 'localhost:7233',
  };

  const connection = await NativeConnection.connect(connectionOptions);

  const workers = await Promise.all([
    Worker.create({
      connection,
      workflowsPath: require.resolve(
        '../../../libs/temporal-workflows/src/lib/all-workflows.js'
      ),
      activities: AllActivities,
      taskQueue: 'formsg-workflow-engine',
    }),
    Worker.create({
      connection,
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
