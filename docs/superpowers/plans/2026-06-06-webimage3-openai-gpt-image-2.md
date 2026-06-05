# WebImage3.0 OpenAI GPT Image 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `WebImage3.0_chatgpt` as a separate project using OpenAI GPT Image 2 for image generation.

**Architecture:** Copy the 2.0 app into an isolated folder, then replace only the image provider boundary, provider environment variables, route wiring, errors, UI copy, and docs. Business flows remain unchanged.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, Supabase, OpenAI Node SDK, Windows PowerShell.

---

## Tasks

- [x] Copy `WebImage2.0_neidi` to `WebImage3.0_chatgpt`, excluding `.git`, `.env.local`, secrets, `node_modules`, `.next`, cache, and preview logs.
- [x] Write failing tests for OpenAI environment parsing, image provider behavior, generate route wiring, provider errors, and UI copy.
- [x] Add `src/lib/openai-images.ts` with GPT Image 2 generate/edit support and proxy resolution.
- [x] Update `/api/generate` to use `createOpenAIClient`, `OPENAI_API_KEY`, and `OPENAI_IMAGE_MODEL`.
- [x] Replace provider error mapping with OpenAI-specific sanitized messages.
- [x] Update visible provider copy, `.env.example`, `docs/env.example`, `docs/local-preview.md`, and `README.md`.
- [x] Run full test, typecheck, and build verification.
- [x] Initialize a new Git repository and set `origin` to `https://github.com/Draper002/ImageAi_3.0.git`.
