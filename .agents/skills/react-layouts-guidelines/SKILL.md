---
name: react-layouts-guidelines
description: Provides Client and Server runtime decision-making and implementation guidelines for @adonis-kit/react-layouts. Use when requests involve withLayouts, withServerLayouts, useLayoutProps, useAllLayoutProps, @adonis-kit/react-layouts/client, @adonis-kit/react-layouts/server, Next.js App Router layout/page runtime boundaries, or reading page and layout props within layouts.
---

# React Layouts Runtime Guidelines

## Overview

Determine the runtime based on user code context and goals, then choose `withLayouts` or `withServerLayouts`, and output ready-to-use implementation with verification steps.
Focus on three core concerns: import boundaries, layout composition order, and props visibility with type safety.

## Runtime Decision Tree

1. Determine if it is a Client Component.
- File contains `'use client'`, or user explicitly needs client-side hooks — take the Client path.

2. Default to the Server path otherwise.
- Next.js App Router `layout.tsx` and `page.tsx` are Server Components by default.

3. Correct runtime conflicts immediately.
- If the user uses `useLayoutProps` or `useAllLayoutProps` in a Server Component, switch to the `withServerLayouts` approach.

4. Enforce import boundaries.
- Client approach: import from `@adonis-kit/react-layouts/client` or root entry `@adonis-kit/react-layouts` (both are equivalent — root entry re-exports all `/client` APIs with `'use client'`).
- Server approach: import only from `@adonis-kit/react-layouts/server`.
- Never import root entry or `/client` in Server Components; never import `/server` in Client Components.

## Execution Workflow

1. Extract input conditions.
- Identify runtime, Page props structure, number of layouts, whether cross-layout props reading is needed, and whether `propertiesHoist` is required.

2. Select API.
- Client approach: `withLayouts`, `useLayoutProps`, `useAllLayoutProps`.
- Server approach: `withServerLayouts`, `ServerLayoutComponent`, `getLayoutProps`.

3. Generate core code.
- Strictly maintain inside-out composition order: `[Layout1, Layout2]` produces `<Layout2><Layout1><Page /></Layout1></Layout2>`.
- Output a minimal working example with correct import paths.

4. Explain boundary behavior.
- Missing component lookup returns `undefined`.
- `ReadonlyMap` is read-only and cannot be written to.

5. Provide verification steps.
- Include at least one layout order verification and one props reading verification.

## Reference Routing

- For Client composition, hooks usage, and `propertiesHoist` constraints, read `references/with-layouts.md`.
- For Server composition, `getLayoutProps` semantics, chain visibility, and async layouts, read `references/with-server-layouts.md`.
- For runtime conflict resolution or migration, read both references and output the runtime decision first.

## Output Contract

Output must include the following:

1. Runtime decision.
- Explicitly state Client or Server with the reasoning.

2. Correct import path.
- Specify `@adonis-kit/react-layouts/client` or `@adonis-kit/react-layouts/server`.

3. Core implementation code.
- Provide complete `withLayouts` or `withServerLayouts` composition code.

4. Boundary explanation.
- Explain `undefined` returns, read-only map, composition order, and hooks availability scope.

5. Minimal verification steps.
- Provide executable checkpoints describing how to confirm correctness.
