#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: Please set the Form ID." >&2
  exit 1
fi

FORM_ID=$1
RECIPIENT_EMAIL=${2:-"example@gmail.com"}

temporal schedule create \
  --address "localhost:7233" \
  --schedule-id "collate-${FORM_ID}" \
  --interval '1m' \
  --task-queue 'collation-scheduler' \
  --type "collate${FORM_ID}Workflow" \
  --catchup-window '1d' \
  --overlap-policy 'AllowAll' \
  --input "\"${FORM_ID}\"" \
  --input "\"${RECIPIENT_EMAIL}\""