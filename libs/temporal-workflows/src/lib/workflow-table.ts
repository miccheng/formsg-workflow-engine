import { process675d3e0bf7757f96a3e82d2dWorkflow } from './workflows/process-675d3e0bf7757f96a3e82d2d-workflow';
import { process679e22730bad842cc4b76974workflow } from './workflows/process-679e22730bad842cc4b76974-workflow';
import { process67a708c9dcc3e09f3a3393f5Workflow } from './workflows/process-67a708c9dcc3e09f3a3393f5-workflow';
import { collate675d3e0bf7757f96a3e82d2dWorkflow } from './workflows/collate-675d3e0bf7757f96a3e82d2d-workflow';

export const WorkflowTable = {
  '675d3e0bf7757f96a3e82d2d': process675d3e0bf7757f96a3e82d2dWorkflow,
  'collate-675d3e0bf7757f96a3e82d2d': collate675d3e0bf7757f96a3e82d2dWorkflow,
  '679e22730bad842cc4b76974': process679e22730bad842cc4b76974workflow,
  '67a708c9dcc3e09f3a3393f5': process67a708c9dcc3e09f3a3393f5Workflow,
};
