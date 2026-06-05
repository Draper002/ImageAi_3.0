import { describe, expect, test } from "vitest";
import { generationFailurePayload } from "./generation-errors";

describe("generationFailurePayload", () => {
  test("maps invalid OpenRouter API key errors to a clear user-facing message", () => {
    expect(generationFailurePayload(new Error("OpenRouter request failed with status 401 Unauthorized"))).toEqual({
      code: "openrouter_auth_error",
      error: "OpenRouter API Key invalid or missing. Check OPENROUTER_API_KEY."
    });
  });

  test("maps quota, balance, and rate limit errors", () => {
    for (const message of ["quota exceeded", "insufficient balance", "rate limit reached"]) {
      expect(generationFailurePayload(new Error(message))).toEqual({
        code: "openrouter_quota_error",
        error: "OpenRouter account quota, balance, or rate limit is not enough. Check billing or retry later."
      });
    }
  });

  test("maps model, permission, and missing model errors", () => {
    for (const message of ["model permission denied", "model does not exist"]) {
      expect(generationFailurePayload(new Error(message))).toEqual({
        code: "openrouter_model_error",
        error: "OpenRouter image model is unavailable or the account lacks permission. Check OPENROUTER_IMAGE_MODEL and model access."
      });
    }
  });

  test("maps reference image errors", () => {
    for (const message of ["image url is invalid", "reference image failed", "invalid image content"]) {
      expect(generationFailurePayload(new Error(message))).toEqual({
        code: "openrouter_image_error",
        error: "OpenRouter could not process the reference image. Check the file format and try again."
      });
    }
  });

  test("maps fetch, timeout, and connection errors", () => {
    for (const message of ["fetch failed", "request timeout", "connection reset"]) {
      expect(generationFailurePayload(new Error(message))).toEqual({
        code: "openrouter_connection_error",
        error: "Connection to OpenRouter failed. Check network, proxy settings, or retry later."
      });
    }
  });

  test("falls back to an OpenRouter-specific generic failure", () => {
    expect(generationFailurePayload(new Error("unexpected provider failure"))).toEqual({
      code: "generation_failed",
      error: "Generation failed. Check OpenRouter configuration, model access, or retry later."
    });
  });
});
