# WebImage3.0 OpenRouter GPT-5.4 Image 2 Design

## Goal

Create `WebImage3.0_chatgpt` as a separate website folder based on `WebImage2.0_neidi`, keeping the 2.0 business flows while replacing the image provider with OpenRouter routing for OpenAI GPT-5.4 Image 2.

## Scope

- Preserve login, credits, Alipay recharge, invitation rewards, promotion cases, admin, history, and Supabase storage flows.
- Use `OPENROUTER_API_KEY` and default `OPENROUTER_IMAGE_MODEL=openai/gpt-5.4-image-2`.
- Keep the generated image stored in Supabase private storage.
- Keep optional reference image upload and pass the uploaded `File` as image input to OpenRouter chat completions.
- Keep `WebImage2.0_neidi` unchanged.

## Provider Flow

1. `/api/generate` validates the authenticated user and parsed form input.
2. The generation row is inserted with `processing` status.
3. One credit is reserved.
4. If a reference image exists, it is uploaded to `reference-images` for history.
5. `src/lib/openrouter-images.ts` calls OpenRouter chat completions with image output requested.
6. The returned base64 image is decoded and stored in `generated-images`.
7. The generation row is marked `succeeded` and a temporary signed URL is returned.
8. On provider failure, the reserved credit is refunded and a sanitized error is stored.

## Verification

- Provider adapter tests cover request construction, size mapping, image decoding, base URL normalization, and missing image data.
- Environment tests require `OPENROUTER_API_KEY` and default the model to `openai/gpt-5.4-image-2`.
- Route tests confirm OpenRouter GPT-5.4 Image 2 wiring, reference image persistence, generated image storage, refunds, and sanitized errors.
- UI tests confirm provider copy says OpenRouter GPT-5.4 Image 2.
