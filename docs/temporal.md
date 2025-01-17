# Temporal Commands

## Create Schedule

```bash
export FORM_ID=675d3e0bf7757f96a3e82d2d
export RECIPIENT_EMAIL=ren@gmail.com

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
```

## Delete Schedule

```bash
export FORM_ID=675d3e0bf7757f96a3e82d2d

temporal schedule delete \
  --address "localhost:7233" \
  --schedule-id "collate-${FORM_ID}"
```
