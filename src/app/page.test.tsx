import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import HomePage from "./page";

const legacyBailian = new RegExp("Bail" + "ian");

describe("HomePage", () => {
  test("renders GPT Image 2 provider copy in Chinese by default", async () => {
    render(await HomePage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText(/GPT Image 2/)).toBeInTheDocument();
    expect(screen.queryByText(/Wan2\.7/)).not.toBeInTheDocument();
    expect(screen.queryByText(legacyBailian)).not.toBeInTheDocument();
  });

  test("renders OpenAI GPT Image 2 provider copy in English", async () => {
    render(await HomePage({ searchParams: Promise.resolve({ locale: "en" }) }));

    expect(screen.getByText(/OpenAI GPT Image 2/)).toBeInTheDocument();
    expect(screen.queryByText(/Wan2\.7/)).not.toBeInTheDocument();
    expect(screen.queryByText(legacyBailian)).not.toBeInTheDocument();
  });
});
