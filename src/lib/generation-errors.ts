export type GenerationFailurePayload = {
  code: string;
  error: string;
};

export function messageFromUnknownError(error: unknown) {
  return error instanceof Error ? error.message : "Generation failed";
}

export function generationFailurePayload(error: unknown): GenerationFailurePayload {
  const normalized = messageFromUnknownError(error).toLowerCase();

  if (
    normalized.includes("api-key") ||
    normalized.includes("api key") ||
    normalized.includes("unauthorized") ||
    normalized.includes("401")
  ) {
    return {
      code: "openrouter_auth_error",
      error: "OpenRouter API Key invalid or missing. Check OPENROUTER_API_KEY."
    };
  }

  if (
    normalized.includes("quota") ||
    normalized.includes("balance") ||
    normalized.includes("rate limit") ||
    normalized.includes("throttl")
  ) {
    return {
      code: "openrouter_quota_error",
      error: "OpenRouter account quota, balance, or rate limit is not enough. Check billing or retry later."
    };
  }

  if (
    normalized.includes("model") ||
    normalized.includes("permission") ||
    normalized.includes("does not exist")
  ) {
    return {
      code: "openrouter_model_error",
      error: "OpenRouter image model is unavailable or the account lacks permission. Check OPENROUTER_IMAGE_MODEL and model access."
    };
  }

  if (
    normalized.includes("image url") ||
    normalized.includes("reference image") ||
    normalized.includes("invalid image") ||
    normalized.includes("not accessible")
  ) {
    return {
      code: "openrouter_image_error",
      error: "OpenRouter could not process the reference image. Check the file format and try again."
    };
  }

  if (
    normalized.includes("connection") ||
    normalized.includes("connect timeout") ||
    normalized.includes("timeout") ||
    normalized.includes("fetch failed")
  ) {
    return {
      code: "openrouter_connection_error",
      error: "Connection to OpenRouter failed. Check network, proxy settings, or retry later."
    };
  }

  return {
    code: "generation_failed",
    error: "Generation failed. Check OpenRouter configuration, model access, or retry later."
  };
}
