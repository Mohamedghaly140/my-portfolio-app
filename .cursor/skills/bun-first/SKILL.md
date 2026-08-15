---
name: bun-first
description: Use Bun for install, scripts, tests, and package management instead of Node, npm, yarn, or pnpm. Use when adding packages, running scripts, or writing repo tooling.
---

# Bun-First Development

We default to **Bun** as our JavaScript runtime, package manager, and task runner.
Assume Bun is available unless explicitly stated otherwise.

## General Principles

- **PREFER** Bun over Node.js, npm, pnpm, or yarn
- **PREFER** Bun’s built-in features over third-party tools when available
- **PRFER** Bun's native APIs (eg for file access, SQL, S3 etc) over Node.js APIs

## Package Management

- **USE** `bun install`, `bun add`, `bun remove`
- **AVOID** `npm`, `yarn`, `pnpm`
- Prefer Bun-native lockfiles and resolution behavior
- Keep dependencies minimal and intentional

## Scripts & Tooling

- **PREFER** `bun run` for scripts
- **USE** `bun test` for unit tests in this repo
- **AVOID** `bun build` — Expo/Metro owns bundling, not Vite
- Avoid introducing extra task runners unless required

## Runtime & APIs

- **PREFER** Bun’s native APIs (fetch, fs, path, env handling)
- Write code assuming modern Web APIs are available in the runtime
- Avoid Node-specific APIs unless explicitly required

## Performance & DX

- Prefer simple, explicit scripts over complex toolchains
- **AVOID** unnecessary abstractions
