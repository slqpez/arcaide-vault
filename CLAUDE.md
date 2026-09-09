# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault — a platform for playing games online and competing for the highest score (see README.md, written in Spanish).

## Stack

- Next.js 16.3.4 (App Router, in `app/`), React 19.2.8, TypeScript (strict), Tailwind CSS v4, ESLint 9 flat config.
- No test runner, database, or backend is configured yet — this is still the unmodified `create-next-app` scaffold.

## Commands

```bash
npm run dev      # start dev server (also regenerates AGENTS.md's Next.js banner — see below)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint
```

## Critical: read Next.js docs before coding

Per AGENTS.md, this Next.js version has breaking API/convention changes vs. training data. Before writing any Next.js code, read the relevant guide under `node_modules/next/dist/docs/` (`01-app/`, `02-pages/`, `03-architecture/`, `04-community/`). Heed deprecation notices.

The `@AGENTS.md` import block at the top of this file is auto-written by `next dev` on every run (see `node_modules/next/dist/server/lib/generate-agent-files.js`). Don't strip it from diffs — removing it just recreates the same uncommitted change on the next `next dev`; commit it along with your other work to keep the tree clean.

## Workflow: Spec Driven Design

This project follows spec-driven development using the `fernando-skills` skill set (see https://github.com/Klerith/fernando-skills), installed via:

```bash
npx skills@latest add Klerith/fernando-skills
```

Work is expected to flow through `/spec` (write a spec) and `/spec-impl` (implement from a spec) rather than ad hoc implementation. These skill commands are not yet installed in this repo — install them first if asked to follow this workflow.
