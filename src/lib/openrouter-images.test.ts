import { Buffer } from "node:buffer";
import { describe, expect, test, vi } from "vitest";
import {
  DEFAULT_OPENROUTER_API_BASE_URL,
  OPENROUTER_CHAT_COMPLETIONS_ENDPOINT,
  buildOpenRouterImageRequest,
  createOpenRouterClient,
  generateImage,
  sizeForAspectRatio
} from "./openrouter-images";

describe("sizeForAspectRatio", () => {
  test.each([
    ["1:1", "1024x1024"],
    ["4:5", "1024x1536"],
    ["16:9", "1536x1024"],
    ["9:16", "1024x1536"],
    ["3:2", "1536x1024"],
    ["unknown", "1024x1024"]
  ])("maps %s to %s", (aspectRatio, expectedSize) => {
    expect(sizeForAspectRatio(aspectRatio)).toBe(expectedSize);
  });
});

describe("buildOpenRouterImageRequest", () => {
  test("builds a text-only GPT-5.4 Image 2 request", async () => {
    await expect(buildOpenRouterImageRequest({
      model: "openai/gpt-5.4-image-2",
      prompt: "Create a product photo",
      aspectRatio: "16:9"
    })).resolves.toEqual({
      model: "openai/gpt-5.4-image-2",
      modalities: ["image", "text"],
      messages: [{
        role: "user",
        content: "Create a product photo"
      }],
      image_config: {
        size: "1536x1024"
      }
    });
  });

  test("builds a reference-image request with a data URL content part", async () => {
    const request = await buildOpenRouterImageRequest({
      model: "openai/gpt-5.4-image-2",
      prompt: "Use this composition",
      aspectRatio: "1:1",
      referenceImage: new File([Buffer.from("reference")], "ref.png", { type: "image/png" })
    });

    expect(request).toEqual({
      model: "openai/gpt-5.4-image-2",
      modalities: ["image", "text"],
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Use this composition" },
          { type: "image_url", image_url: { url: "data:image/png;base64,cmVmZXJlbmNl" } }
        ]
      }],
      image_config: {
        size: "1024x1024"
      }
    });
  });
});

describe("generateImage", () => {
  test("posts to OpenRouter chat completions and returns image bytes", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{
        message: {
          images: [{
            image_url: { url: "data:image/png;base64,aGVsbG8=" }
          }]
        }
      }]
    }), {
      status: 200,
      headers: { "content-type": "application/json" }
    }));

    const result = await generateImage({
      client: {
        apiKey: "openrouter-key",
        baseUrl: "https://openrouter.example/api/v1",
        appUrl: "https://image.zylgzx.cn",
        appTitle: "PromptCanvas 3.0",
        fetch
      },
      model: "openai/gpt-5.4-image-2",
      prompt: "Create image",
      aspectRatio: "1:1"
    });

    expect(fetch).toHaveBeenCalledWith(
      `https://openrouter.example/api/v1${OPENROUTER_CHAT_COMPLETIONS_ENDPOINT}`,
      expect.objectContaining({
        method: "POST",
        headers: {
          authorization: "Bearer openrouter-key",
          "content-type": "application/json",
          "http-referer": "https://image.zylgzx.cn",
          "x-title": "PromptCanvas 3.0"
        }
      })
    );
    expect(JSON.parse(fetch.mock.calls[0][1].body as string)).toEqual(await buildOpenRouterImageRequest({
      model: "openai/gpt-5.4-image-2",
      prompt: "Create image",
      aspectRatio: "1:1"
    }));
    expect(result).toEqual(Buffer.from("hello"));
  });

  test("normalizes trailing slash in the OpenRouter base URL", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { images: [{ image_url: { url: "data:image/png;base64,aGVsbG8=" } }] } }]
    }), {
      status: 200,
      headers: { "content-type": "application/json" }
    }));

    await generateImage({
      client: {
        ...createOpenRouterClient("openrouter-key", {
          baseUrl: "https://openrouter.example/api/v1/",
          appUrl: "https://image.zylgzx.cn"
        }),
        fetch
      },
      model: "openai/gpt-5.4-image-2",
      prompt: "Create image",
      aspectRatio: "1:1"
    });

    expect(fetch.mock.calls[0][0]).toBe(`https://openrouter.example/api/v1${OPENROUTER_CHAT_COMPLETIONS_ENDPOINT}`);
  });

  test("throws a clean provider error without echoing raw response bodies", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("provider secret details", {
      status: 401,
      statusText: "Unauthorized",
      headers: { "content-type": "text/plain" }
    }));

    await expect(generateImage({
      client: {
        apiKey: "openrouter-key",
        baseUrl: DEFAULT_OPENROUTER_API_BASE_URL,
        fetch
      },
      model: "openai/gpt-5.4-image-2",
      prompt: "Create image",
      aspectRatio: "1:1"
    })).rejects.toThrow("OpenRouter request failed with status 401 Unauthorized");
  });

  test("throws when OpenRouter returns no image data", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: "no image" } }]
    }), {
      status: 200,
      headers: { "content-type": "application/json" }
    }));

    await expect(generateImage({
      client: {
        apiKey: "openrouter-key",
        baseUrl: DEFAULT_OPENROUTER_API_BASE_URL,
        fetch
      },
      model: "openai/gpt-5.4-image-2",
      prompt: "Create image",
      aspectRatio: "1:1"
    })).rejects.toThrow("OpenRouter did not return image data.");
  });
});
