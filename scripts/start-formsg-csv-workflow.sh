#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: Please set the Form ID." >&2
  exit 1
fi

if [ -z "$2" ]; then
  echo "Error: File path needed" >&2
  exit 1
fi

FORM_ID=$1
FILE_PATH=$2

temporal workflow start \
  --address "localhost:7233" \
  --workflow-id "batch-process-formsg-csv-${FORM_ID}" \
  --task-queue "formsg-workflow-engine" \
  --type "batchProcessFormsgCsvWorkflow" \
  --input "\"${FORM_ID}\"" \
  --input "\"${FILE_PATH}\""