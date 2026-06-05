import { describe, expect, test, vi } from "vitest";
import { generateImage, resolveOpenAIProxyUrl, sizeForAspectRatio } from "./openai-images";

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

describe("generateImage", () => {
  test("uses GPT Image 2 text generation when no reference image exists", async () => {
    const generate = vi.fn().mockResolvedValue({ data: [{ b64_json: "aGVsbG8=" }] });
    const edit = vi.fn();

    const bytes = await generateImage({
      client: { images: { generate, edit } },
      model: "gpt-image-2",
      prompt: "Create image",
      aspectRatio: "1:1"
    });

    expect(generate).toHaveBeenCalledWith({
      model: "gpt-image-2",
      prompt: "Create image",
      size: "1024x1024"
    });
    expect(edit).not.toHaveBeenCalled();
    expect(bytes.toString("utf8")).toBe("hello");
  });

  test("uses GPT Image 2 edit flow when reference image exists", async () => {
    const generate = vi.fn();
    const edit = vi.fn().mockResolvedValue({ data: [{ b64_json: "aGVsbG8=" }] });
    const referenceImage = new File(["image"], "ref.png", { type: "image/png" });

    await generateImage({
      client: { images: { generate, edit } },
      model: "gpt-image-2",
      prompt: "Use this composition",
      aspectRatio: "16:9",
      referenceImage
    });

    expect(edit).toHaveBeenCalledWith({
      model: "gpt-image-2",
      image: referenceImage,
      prompt: "Use this composition",
      size: "1536x1024"
    });
    expect(generate).not.toHaveBeenCalled();
  });

  test("throws when OpenAI returns no image data", async () => {
    const generate = vi.fn().mockResolvedValue({ data: [{}] });

    await expect(generateImage({
      client: { images: { generate, edit: vi.fn() } },
      model: "gpt-image-2",
      prompt: "Create image",
      aspectRatio: "1:1"
    })).rejects.toThrow("OpenAI did not return image data.");
  });

  test("resolves an optional OpenAI proxy URL", () => {
    expect(resolveOpenAIProxyUrl({
      HTTP_PROXY: "http://127.0.0.1:1080",
      HTTPS_PROXY: "http://127.0.0.1:7890",
      OPENAI_PROXY_URL: "http://127.0.0.1:7897"
    })).toBe("http://127.0.0.1:7897");

    expect(resolveOpenAIProxyUrl({
      HTTPS_PROXY: "http://127.0.0.1:7890"
    })).toBe("http://127.0.0.1:7890");

    expect(resolveOpenAIProxyUrl({})).toBeUndefined();
  });
});
