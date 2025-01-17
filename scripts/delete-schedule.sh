#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: Please set the Form ID." >&2
  exit 1
fi

FORM_ID=$1

temporal schedule delete \
  --address "localhost:7233" \
  --schedule-id "collate-${FORM_ID}"