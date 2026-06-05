import { describe, expect, test } from "vitest";
import { generationFailurePayload } from "./generation-errors";

describe("generationFailurePayload", () => {
  test("maps invalid OpenAI API key errors to a clear user-facing message", () => {
    expect(generationFailurePayload(new Error("Invalid API-key provided."))).toEqual({
      code: "openai_auth_error",
      error: "OpenAI API Key invalid or missing. Check OPENAI_API_KEY."
    });
  });

  test("maps quota, balance, and rate limit errors", () => {
    for (const message of ["quota exceeded", "insufficient balance", "rate limit reached"]) {
      expect(generationFailurePayload(new Error(message))).toEqual({
        code: "openai_quota_error",
        error: "OpenAI account quota, balance, or rate limit is not enough. Check billing or retry later."
      });
    }
  });

  test("maps model, permission, and missing model errors", () => {
    for (const message of ["model permission denied", "model does not exist"]) {
      expect(generationFailurePayload(new Error(message))).toEqual({
        code: "openai_model_error",
        error: "OpenAI image model is unavailable or the account lacks permission. Check OPENAI_IMAGE_MODEL and model access."
      });
    }
  });

  test("maps reference image errors", () => {
    for (const message of ["image url is invalid", "reference image failed", "signed url expired", "not accessible"]) {
      expect(generationFailurePayload(new Error(message))).toEqual({
        code: "openai_image_error",
        error: "OpenAI could not process the reference image. Check the file format and try again."
      });
    }
  });

  test("maps fetch, timeout, and connection errors", () => {
    for (const message of ["fetch failed", "request timeout", "connection reset"]) {
      expect(generationFailurePayload(new Error(message))).toEqual({
        code: "openai_connection_error",
        error: "Connection to OpenAI failed. Check network, proxy settings, or retry later."
      });
    }
  });

  test("falls back to an OpenAI-specific generic failure", () => {
    expect(generationFailurePayload(new Error("unexpected provider failure"))).toEqual({
      code: "generation_failed",
      error: "Generation failed. Check OpenAI configuration, model access, or retry later."
    });
  });
});
