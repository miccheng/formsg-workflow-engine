# FormSG Workflow Engine

![System Architecture](./system_architecture.png)

## Setup

1. Install the dependencies

   ```bash
   npm install
   ```

2. Get your Ngrok Authentication Token from [here](https://dashboard.ngrok.com/get-started/your-authtoken).

3. Copy `env.sample` to `.env` and change the `NGROK_AUTHTOKEN`, `NGROK_DOMAIN`, `FORM_SECRET_KEY` to your values to your values:

   ```bash
   NGROK_AUTHTOKEN=ABCS1234
   NGROK_DOMAIN=regular-lucky-coral.ngrok-free.app
   FORM_SECRET_KEY=CHANGE_ME
   DATABASE_URL=postgresql://formsgworkflow:password1234@localhost:5432/formsgworkflow?schema=public
   ```

4. Start the backing services:

   ```bash
   docker compose up -d
   ```

### Database Migration

1. Run the database migration

   ```bash
   npx nx prisma-push formsg-workflow-engine
   ```

2. Generate the Prisma Client

   ```bash
   npx nx prisma-generate formsg-workflow-engine
   ```

3. To create a new migration file from changes made to `schema.prisma`:

   ```bash
   npx nx prisma-migrate formsg-workflow-engine --name <new_migration_name>
   ```

4. To run the database seed from `seed_data.ts`:

   ```bash
   npx nx prisma-seed formsg-workflow-engine --script seed_data.ts
   ```

## Run

1. Start the NestJS app

   ```bash
   npx nx serve formsg-workflow-engine
   ```

2. Start the Temporal Worker

   ```bash
   npx nx serve temporal-worker
   ```

### Check the application is running

- **NestJS Application:** http://localhost:3000/api/submissions
- **Temporal Web UI:** http://localhost:8233
- **MailDev Web UI**: http://localhost:1080
- **Ngrok Web UI**: http://localhost:4040

## Unit Tests

```bash
npx nx test formsg-workflow-engine
npx nx test temporal-workflows
```
