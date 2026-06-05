# WebImage3.0 OpenAI GPT Image 2 Design

## Goal

Create `WebImage3.0_chatgpt` as a separate website folder based on `WebImage2.0_neidi`, keeping the 2.0 business flows while replacing the image provider with OpenAI GPT Image 2.

## Scope

- Preserve login, credits, Alipay recharge, invitation rewards, promotion cases, admin, history, and Supabase storage flows.
- Use `OPENAI_API_KEY` and default `OPENAI_IMAGE_MODEL=gpt-image-2`.
- Keep the generated image stored in Supabase private storage.
- Keep optional reference image upload and pass the uploaded `File` directly to the OpenAI image edit flow.
- Keep `WebImage2.0_neidi` unchanged.

## Provider Flow

1. `/api/generate` validates the authenticated user and parsed form input.
2. The generation row is inserted with `processing` status.
3. One credit is reserved.
4. If a reference image exists, it is uploaded to `reference-images` for history.
5. `src/lib/openai-images.ts` calls `client.images.edit` with the reference image, or `client.images.generate` without one.
6. The returned base64 image is decoded and stored in `generated-images`.
7. The generation row is marked `succeeded` and a temporary signed URL is returned.
8. On provider failure, the reserved credit is refunded and a sanitized error is stored.

## Verification

- Provider adapter tests cover size mapping, generate/edit routing, image decoding, missing image data, and proxy resolution.
- Environment tests require `OPENAI_API_KEY` and default the model to `gpt-image-2`.
- Route tests confirm GPT Image 2 wiring, reference image persistence, generated image storage, refunds, and sanitized errors.
- UI tests confirm provider copy says OpenAI GPT Image 2.
