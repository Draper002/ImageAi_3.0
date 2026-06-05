import { describe, expect, test } from "vitest";
import { hasSupabasePublicConfig, parseEnv } from "./env";

const requiredEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  SUPABASE_SERVICE_ROLE_KEY: "service",
  OPENAI_API_KEY: "openai",
  NEXT_PUBLIC_APP_URL: "https://app.example.com"
};

describe("parseEnv", () => {
  test("returns typed OpenAI environment values with GPT Image 2 defaults when all required keys exist", () => {
    const result = parseEnv(requiredEnv);

    expect(result).toEqual({
      ...requiredEnv,
      OPENAI_IMAGE_MODEL: "gpt-image-2"
    });
  });

  test("allows OpenAI image model override", () => {
    const result = parseEnv({
      ...requiredEnv,
      OPENAI_IMAGE_MODEL: "custom-image-model"
    });

    expect(result.OPENAI_IMAGE_MODEL).toBe("custom-image-model");
  });

  test("throws a useful error when a required key is missing", () => {
    expect(() => parseEnv({})).toThrow("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });

  test("requires OpenAI API key and ignores legacy Bailian provider config", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
        SUPABASE_SERVICE_ROLE_KEY: "service",
        BAILIAN_API_KEY: "legacy",
        BAILIAN_IMAGE_MODEL: "legacy-image-model",
        BAILIAN_API_BASE_URL: "https://dashscope.example/api/v1",
        NEXT_PUBLIC_APP_URL: "https://app.example.com"
      })
    ).toThrow("Missing environment variable: OPENAI_API_KEY");
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
