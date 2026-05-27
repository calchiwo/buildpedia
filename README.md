# Buildpedia

Buildpedia is the open encyclopedia for builders, founders, and the startups they create.

It is a community-driven web app where people can discover builder profiles, publish founder pages, track startup history, surface products and milestones, and rank notable builders through a public Build Score system.

## What Buildpedia Does

Buildpedia combines a public knowledge base with lightweight profile management:

- Search for builders and founder pages.
- Create public pages for founders and builders.
- Publish long-form biographies and histories with Markdown content.
- Link founders to startups they built.
- Show product launches, milestones, metrics, and page analytics.
- Rank builders on a public leaderboard using Build Score.
- Let real founders claim their page and request verification.
- Moderate submitted content through a Supabase Edge Function.

## Core Product Experience

The current application is organized around a few main flows:

- Home page: highlights trending builders and recently created pages.
- Search: looks up builder pages by founder name.
- Builder page: displays biography, timeline, startups, products, metrics, analytics, and share/claim actions.
- Create page: lets signed-in users publish a new founder page.
- Edit/manage: lets authenticated users update page content and supporting data.
- Leaderboard: ranks builders by Build Score.
- Profile/auth: handles sign-in state and user identity through Supabase Auth.

## Product Positioning

Buildpedia is built around a simple idea:

> The open encyclopedia for builders, founders and the startups they create.

That means the product is not just a profile directory. It is intended to become a structured public record of:

- who built what
- what they launched
- when key milestones happened
- how their work is evolving over time

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- Radix UI
- Supabase
- Vitest
- Playwright

## Project Structure

Key areas of the repo:

- `src/pages/`: route-level pages such as home, search, builder pages, create/edit flows, leaderboard, auth, and profile.
- `src/components/builder/`: builder-specific modules for timeline, startups, products, analytics, metrics, badges, claims, and page management.
- `src/integrations/supabase/`: generated Supabase client and database types.
- `supabase/functions/moderate-content/`: Edge Function used to moderate submitted content.
- `supabase/migrations/`: database schema migrations.

## Local Development

### Prerequisites

- Node.js 18+
- npm
- A Supabase project

### Environment Variables

Create a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

If you want content moderation to work locally, you will also need the matching Supabase project and Edge Function setup for `moderate-content`.

### Install Dependencies

```bash
npm install
```

### Start the App

```bash
npm run dev
```

The Vite dev server runs on `http://localhost:8080`.

### Run Tests

```bash
npm test
```

## Available Scripts

- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run build:dev` creates a development-mode build.
- `npm run preview` previews the production build locally.
- `npm run lint` runs ESLint.
- `npm test` runs the Vitest suite once.
- `npm run test:watch` runs Vitest in watch mode.

## Data Model At a Glance

From the current app structure, Buildpedia centers on:

- `founder_pages`
- `founder_startups`
- `startups`
- `product_launches`
- `milestones`
- `founder_metrics`
- `page_views`
- `page_claims`

These power the public builder pages, rankings, analytics, and verification workflow.

## Current State

The product already includes the core mechanics for a public builder encyclopedia:

- public profile pages
- search and discovery
- leaderboard ranking
- community page creation
- claim/verification flow
- moderation support

The next major step is product maturity: stronger editorial structure, better entity relationships, richer startup pages, and tighter verification/admin workflows.

## Vision

Buildpedia aims to become the canonical public record for ambitious people who build companies and products.

Not a social feed. Not a hiring profile. Not a startup database in isolation.

A living encyclopedia of builders, founders, and the startups they create.

## License

Buildpedia is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Built by
Sharav Arora and Caleb Wodi