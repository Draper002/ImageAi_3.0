import { Buffer } from "node:buffer";

export const DEFAULT_OPENROUTER_API_BASE_URL = "https://openrouter.ai/api/v1";
export const OPENROUTER_CHAT_COMPLETIONS_ENDPOINT = "/chat/completions";

export type OpenRouterImageClient = {
  apiKey: string;
  baseUrl: string;
  appUrl?: string;
  appTitle?: string;
  fetch: typeof fetch;
};

type OpenRouterContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type OpenRouterImageRequest = {
  model: string;
  modalities: ["image", "text"];
  messages: [{
    role: "user";
    content: string | OpenRouterContentPart[];
  }];
  image_config: {
    size: "1024x1024" | "1536x1024" | "1024x1536";
  };
};

type BuildOpenRouterImageRequestInput = {
  model: string;
  prompt: string;
  aspectRatio: string;
  referenceImage?: File;
};

type GenerateImageInput = BuildOpenRouterImageRequestInput & {
  client: OpenRouterImageClient;
};

type OpenRouterImagePayload = {
  choices?: Array<{
    message?: {
      images?: Array<{
        image_url?: { url?: string | null };
        imageUrl?: { url?: string | null };
      }>;
    };
  }>;
};

export function sizeForAspectRatio(aspectRatio: string): "1024x1024" | "1536x1024" | "1024x1536" {
  if (aspectRatio === "16:9" || aspectRatio === "3:2") return "1536x1024";
  if (aspectRatio === "9:16" || aspectRatio === "4:5") return "1024x1536";
  return "1024x1024";
}

export async function buildOpenRouterImageRequest({
  model,
  prompt,
  aspectRatio,
  referenceImage
}: BuildOpenRouterImageRequestInput): Promise<OpenRouterImageRequest> {
  const content: string | OpenRouterContentPart[] = referenceImage
    ? [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: await fileToDataUrl(referenceImage) } }
      ]
    : prompt;

  return {
    model,
    modalities: ["image", "text"],
    messages: [{
      role: "user",
      content
    }],
    image_config: {
      size: sizeForAspectRatio(aspectRatio)
    }
  };
}

export async function generateImage({
  client,
  model,
  prompt,
  aspectRatio,
  referenceImage
}: GenerateImageInput): Promise<Buffer> {
  const response = await client.fetch(`${normalizeBaseUrl(client.baseUrl)}${OPENROUTER_CHAT_COMPLETIONS_ENDPOINT}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${client.apiKey}`,
      "content-type": "application/json",
      ...(client.appUrl ? { "http-referer": client.appUrl } : {}),
      ...(client.appTitle ? { "x-title": client.appTitle } : {})
    },
    body: JSON.stringify(await buildOpenRouterImageRequest({
      model,
      prompt,
      aspectRatio,
      referenceImage
    }))
  });

  const responseText = await response.text();
  const payload = parseJsonResponse(responseText);

  if (!response.ok) {
    throw new Error(formatOpenRouterError(response));
  }

  const dataUrl = extractImageDataUrl(payload);
  if (!dataUrl) {
    throw new Error("OpenRouter did not return image data.");
  }

  return decodeDataUrl(dataUrl);
}

export function createOpenRouterClient(
  apiKey: string,
  options: {
    baseUrl?: string;
    appUrl?: string;
    appTitle?: string;
  } = {}
): OpenRouterImageClient {
  return {
    apiKey,
    baseUrl: normalizeBaseUrl(options.baseUrl ?? DEFAULT_OPENROUTER_API_BASE_URL),
    appUrl: options.appUrl,
    appTitle: options.appTitle,
    fetch
  };
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function parseJsonResponse(text: string): unknown {
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function extractImageDataUrl(payload: unknown): string | undefined {
  if (!isRecord(payload) || !Array.isArray((payload as OpenRouterImagePayload).choices)) {
    return undefined;
  }

  for (const choice of (payload as OpenRouterImagePayload).choices ?? []) {
    for (const image of choice.message?.images ?? []) {
      const url = image.image_url?.url ?? image.imageUrl?.url;
      if (typeof url === "string" && url.startsWith("data:image/")) {
        return url;
      }
    }
  }

  return undefined;
}

function decodeDataUrl(dataUrl: string): Buffer {
  const marker = ";base64,";
  const markerIndex = dataUrl.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error("OpenRouter returned unsupported image data.");
  }
  return Buffer.from(dataUrl.slice(markerIndex + marker.length), "base64");
}

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";
  return `data:${contentType};base64,${bytes.toString("base64")}`;
}

function formatOpenRouterError(response: Response) {
  return `OpenRouter request failed with status ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
