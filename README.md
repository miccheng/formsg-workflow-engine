# FormSG Workflow Engine

## Setup

```bash
npm install
```

## Run

```bash
npx nx serve formsg-workflow-engine
```

### Ngrok

1. Get your Ngrok Authentication Token from [here](https://dashboard.ngrok.com/get-started/your-authtoken).

2. Add it to your environment variables (eg. add to last line in `.zshrc` or `.bashrc`).

   ```bash
   export NGROK_AUTHTOKEN=<YOUR_NGROK_AUTHTOKEN>
   ```

   If you have configured a URL for your Ngrok account, use the following instead.

   ```bash
   export NGROK_DOMAIN=<YOUR_NGROK_DOMAIN>
   ```

3. Run the following script.

   ```bash
   ./ngrok.sh
   ```

## Test

```bash
npx nx test formsg-workflow-engine
```
