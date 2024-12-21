# FormSG Workflow Engine

## Setup

1. Install the dependencies

   ```bash
   npm install
   ```

2. Copy `apps/formsg-workflow-engine/env.sample` to `apps/formsg-workflow-engine/.env` and change the `FORM_ID` and `FORM_SECRET_KEY` to your values:

   ```bash
   FORM_ID=CHANGE_ME
   FORM_SECRET_KEY=CHANGE_ME
   DATABASE_URL=postgresql://formsgworkflow:password1234@localhost:5432/formsgworkflow
   ```

## Run

```bash
npx nx serve formsg-workflow-engine
```

### Ngrok

1. Get your Ngrok Authentication Token from [here](https://dashboard.ngrok.com/get-started/your-authtoken).

2. Copy `env.sample` to `.env` and change the variables to your values:

   ```bash
   NGROK_AUTHTOKEN=ABCS1234
   NGROK_DOMAIN=regular-lucky-coral.ngrok-free.app
   DATABASE_URL=postgresql://formsgworkflow:password1234@localhost:5432/formsgworkflow?schema=public
   ```

3. Run the following script.

   ```bash
   ./ngrok.sh
   ```

## Test

```bash
npx nx test formsg-workflow-engine
```
