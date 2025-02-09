import { processWorkflowConceptsWorkflow } from './workflows/process-workflow-concepts-workflow';
import { processSupportingDocDemoWorkflow } from './workflows/process-supporting-doc-demo-workflow';
import { processDocumentVerificationPocWorkflow } from './workflows/process-document-verification-poc-workflow';
import { collateWorkflowConceptsWorkflow } from './workflows/collate-workflow-concepts-workflow';

export const WorkflowTable = {
  '675d3e0bf7757f96a3e82d2d': processWorkflowConceptsWorkflow,
  'collate-675d3e0bf7757f96a3e82d2d': collateWorkflowConceptsWorkflow,
  '679e22730bad842cc4b76974': processSupportingDocDemoWorkflow,
  '67a708c9dcc3e09f3a3393f5': processDocumentVerificationPocWorkflow,
};
