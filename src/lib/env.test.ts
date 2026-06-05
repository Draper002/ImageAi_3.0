import { describe, expect, test } from "vitest";
import { hasSupabasePublicConfig, parseEnv } from "./env";

const requiredEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  SUPABASE_SERVICE_ROLE_KEY: "service",
  OPENROUTER_API_KEY: "openrouter",
  NEXT_PUBLIC_APP_URL: "https://app.example.com"
};

describe("parseEnv", () => {
  test("returns typed OpenRouter environment values with GPT-5.4 Image 2 defaults", () => {
    const result = parseEnv(requiredEnv);

    expect(result).toEqual({
      ...requiredEnv,
      OPENROUTER_IMAGE_MODEL: "openai/gpt-5.4-image-2",
      OPENROUTER_API_BASE_URL: "https://openrouter.ai/api/v1",
      OPENROUTER_APP_TITLE: "PromptCanvas 3.0"
    });
  });

  test("allows OpenRouter model, base URL, and app title overrides", () => {
    const result = parseEnv({
      ...requiredEnv,
      OPENROUTER_IMAGE_MODEL: "custom/image-model",
      OPENROUTER_API_BASE_URL: "https://example.com/api/v1",
      OPENROUTER_APP_TITLE: "Custom App"
    });

    expect(result.OPENROUTER_IMAGE_MODEL).toBe("custom/image-model");
    expect(result.OPENROUTER_API_BASE_URL).toBe("https://example.com/api/v1");
    expect(result.OPENROUTER_APP_TITLE).toBe("Custom App");
  });

  test("throws a useful error when a required key is missing", () => {
    expect(() => parseEnv({})).toThrow("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });

  test("requires OpenRouter API key and ignores legacy OpenAI provider config", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
        SUPABASE_SERVICE_ROLE_KEY: "service",
        OPENAI_API_KEY: "legacy",
        OPENAI_IMAGE_MODEL: "legacy-image-model",
        NEXT_PUBLIC_APP_URL: "https://app.example.com"
      })
    ).toThrow("Missing environment variable: OPENROUTER_API_KEY");
  });

  test("detects missing Supabase public config", () => {
    expect(hasSupabasePublicConfig({})).toBe(false);
  });

  test("detects present Supabase public config", () => {
    expect(
      hasSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon"
      })
    ).toBe(true);
  });
});
