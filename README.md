# FormSG Workflow Engine

![System Architecture](./system_architecture.png)

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

## Run

1. Start the backing services:

   ```bash
   docker compose up -d
   ```

2. Start the NestJS app

```bash
npx nx serve formsg-workflow-engine
```

3. Start the Temporal Worker

```bash
npx nx serve temporal-worker
```

## Test

```bash
npx nx test formsg-workflow-engine
```
