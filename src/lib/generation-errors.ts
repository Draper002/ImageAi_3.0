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
      code: "openai_auth_error",
      error: "OpenAI API Key invalid or missing. Check OPENAI_API_KEY."
    };
  }

  if (
    normalized.includes("quota") ||
    normalized.includes("balance") ||
    normalized.includes("rate limit") ||
    normalized.includes("throttl")
  ) {
    return {
      code: "openai_quota_error",
      error: "OpenAI account quota, balance, or rate limit is not enough. Check billing or retry later."
    };
  }

  if (
    normalized.includes("model") ||
    normalized.includes("permission") ||
    normalized.includes("does not exist")
  ) {
    return {
      code: "openai_model_error",
      error: "OpenAI image model is unavailable or the account lacks permission. Check OPENAI_IMAGE_MODEL and model access."
    };
  }

  if (
    normalized.includes("image url") ||
    normalized.includes("reference image") ||
    normalized.includes("signed url") ||
    normalized.includes("not accessible")
  ) {
    return {
      code: "openai_image_error",
      error: "OpenAI could not process the reference image. Check the file format and try again."
    };
  }

  if (
    normalized.includes("connection") ||
    normalized.includes("connect timeout") ||
    normalized.includes("timeout") ||
    normalized.includes("fetch failed")
  ) {
    return {
      code: "openai_connection_error",
      error: "Connection to OpenAI failed. Check network, proxy settings, or retry later."
    };
  }

  return {
    code: "generation_failed",
    error: "Generation failed. Check OpenAI configuration, model access, or retry later."
  };
}
