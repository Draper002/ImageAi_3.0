# PromptCanvas 3.0

AI image SaaS built from the 2.0 business flow, with image generation switched to OpenRouter routing for OpenAI GPT-5.4 Image 2 (`openai/gpt-5.4-image-2`). Users can enter a subject, choose image type, ratio, style, scene, whitespace, and optionally upload one reference image. Supabase stores accounts, credits, history, and private images.

## Local Development

1. Install dependencies:

```bash
npm.cmd install --cache .npm-cache
```

2. Copy environment variables:

```bash
copy docs\env.example .env.local
```

3. Fill `.env.local` with Supabase, OpenRouter, Alipay, and admin values.

4. Start the dev server:

```bash
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

5. Open:

```text
http://127.0.0.1:3000
```

## Required Provider Variables

```text
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_IMAGE_MODEL=openai/gpt-5.4-image-2
OPENROUTER_API_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_APP_TITLE=PromptCanvas 3.0
```

`OPENROUTER_IMAGE_MODEL` is optional in code and defaults to `openai/gpt-5.4-image-2`.

## Supabase

Run migrations when initializing the database:

```bash
supabase db push
```

Migration files:

```text
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_payment_orders.sql
supabase/migrations/003_invitation_system.sql
supabase/migrations/004_promotion_features.sql
```

## Verification

```bash
npm.cmd test
npm.cmd exec tsc -- --noEmit --pretty false
npm.cmd run build
```
