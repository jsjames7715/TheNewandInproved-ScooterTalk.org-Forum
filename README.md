# ScooterTalk Forum – Modern Recreation

A fully‑functional recreation of the classic **ScooterTalk.org** electric‑scooter community forum, rebuilt with modern web technologies while preserving the original community spirit and visual aesthetic.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Architecture Diagram](#architecture-diagram)
4. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation & Seeding](#installation--seeding)
   - [Running the App](#running-the-app)
5. [Development Workflow](#development-workflow)
   - [Scripts](#scripts)
   - [Testing](#testing)
6. [API Reference](#api-reference)
7. [Data Model](#data-model)
8. [Deployment](#deployment)
   - [Production Build](#production-build)
   - [Environment Variables](#environment-variables)
9. [Styling & Theming](#styling--theming)
10. [Security Considerations](#security-considerations)
11. [Contributing](#contributing)
12. [License](#license)
13. [Acknowledgments](#acknowledgments)

---

## Project Overview
ScooterTalk Forum is a **full‑stack TypeScript** application that provides:
* **User registration & authentication** with email verification.
* **Categories → Boards → Threads → Posts** hierarchy, mirroring the original forum structure.
* **Rich text posts**, tagging, likes, and moderation tools.
* **Search** (basic placeholder, extensible).
* **Responsive UI** built with **React 19**, **Tailwind CSS**, and **Heroicons**.
* **Type‑safe RPC** communication via **oRPC** (server‑side Hono, client‑side React Query).
* **File‑based storage** using **unstorage**, making the project easy to run locally without a separate database.

---

## Key Features
| Category | Feature |
|---|---|
| **User Management** | Registration, login, logout, email verification, profile editing, avatar upload, role‑based permissions (admin/moderator/user). |
| **Forum Structure** | Categories, boards, threads, posts, tags, pin/lock/archive flags, view counters, like system. |
| **Content Creation** | Rich‑text editor, markdown support, thread creation, reply, edit, delete (with permission checks). |
| **Navigation** | Breadcrumbs, board and thread listings with pagination, infinite scroll (future), quick search. |
| **Responsive Design** | Mobile‑first layout, dark‑mode ready, accessible components. |
| **Performance** | Code‑splitting, lazy loading, server‑side rendering via Hono, static asset serving, caching headers. |
| **Data Migration** | Scripts to import historic content from the original Wayback‑Machine archives (see `scripts/import-archive.ts`). |
| **Testing** | TypeScript type‑checking, linting, and easy extension for unit/e2e tests. |

---

## Architecture Diagram
```
+-------------------+          +-------------------+          +-------------------+
|   Front‑end (React)  | <-- RPC --> |   Server (Hono)   | <-- KV --> |   Storage (unstorage) |
+-------------------+          +-------------------+          +-------------------+
        |                               |                              |
        |                               |                              |
        v                               v                              v
  UI Components               RPC Handlers                JSON files on disk
 (src/client)               (src/server/rpc)            (src/server/lib)
```
* **Client** – React components, React‑Query for data fetching, Tailwind CSS for styling.
* **Server** – Hono HTTP server exposing `/rpc` endpoint; oRPC maps client calls to type‑safe handlers.
* **Storage** – `unstorage` adapters store JSON objects under `./data/` (created at runtime). All reads/writes are fully typed via Zod schemas.

---

## Getting Started
### Prerequisites
* **Node.js** ≥ 18
* **pnpm** package manager (`npm i -g pnpm`)
* Optional: **Git** for version control

### Installation & Seeding
```bash
# Clone the repository (if you haven't already)
git clone <repository-url>
cd quests-template-basic   # adjust to your folder name

# Install dependencies
pnpm install

# Seed the forum with an admin user, categories, boards and a few example threads
pnpm ts scripts/seed-forum.ts
```
The seed script creates:
* Admin user – `admin@scootertalk.org` / `admin123`
* Three top‑level categories (General, Technical, Brand Specific)
* Several boards (General Chat, Newbie Corner, Electric Motors & Wheels, etc.)
* Three sample threads with initial posts.

### Running the App
The Quests environment automatically launches the dev server. To view the app locally:
1. Open the **Preview** pane in the sidebar (or click the **Open in Browser** button if available).
2. Navigate to `http://localhost:5173/forum`.
3. Log in with the admin credentials above.

If you prefer to run the server manually (e.g., outside Quests), you can start the Vite dev server:
```bash
pnpm dev   # starts Hono + Vite with hot‑reloading
```
Then open `http://localhost:5173/forum` in your browser.

---

## Development Workflow
### Scripts
| Script | Description |
|---|---|
| `pnpm dev` | Starts the Vite development server with hot‑reloading. |
| `pnpm build` | Generates a production‑ready build in `dist/`. |
| `pnpm preview` | Serves the production build locally (requires `pnpm build` first). |
| `pnpm ts scripts/seed-forum.ts` | Seeds the database with initial data. |
| `pnpm ts scripts/import-archive.ts` | Imports historic forum data from the attached archive (see `agent-retrieved/`). |

### Testing
The project currently relies on TypeScript's compile‑time safety and ESLint linting. To add unit or integration tests, you can install a test runner (e.g., Vitest) and place tests under `src/**/*.test.ts`. The existing `pnpm lint` and `pnpm check:types` commands ensure code quality.

---

## API Reference
All RPC endpoints are defined under `src/server/rpc/forum/`. The generated TypeScript client (`src/client/rpc-client.ts`) provides strongly‑typed functions.

| Namespace | Method | Input | Description |
|---|---|---|---|
| `auth` | `register` | `{ username, email, password }` | Register a new user and send verification email. |
| `auth` | `login` | `{ email, password }` | Authenticate and receive a session token. |
| `auth` | `logout` | `{ sessionToken }` | Invalidate the session. |
| `auth` | `verifyEmail` | `{ token }` | Verify a pending email address. |
| `content` | `getCategories` | `none` | List all categories with their boards. |
| `content` | `getBoard` | `{ boardId, limit?, offset? }` | Fetch board details and recent threads. |
| `content` | `createThread` | `{ sessionToken, boardId, title, content, tags? }` | Create a new discussion thread. |
| `content` | `getThread` | `{ threadId, limit?, offset? }` | Retrieve a thread with its posts. |
| `content` | `createReply` | `{ sessionToken, threadId, content }` | Post a reply in a thread. |
| `content` | `editPost` | `{ sessionToken, postId, content }` | Edit a post (author or moderator only). |
| `content` | `searchThreads` | `{ query, boardId?, limit? }` | Placeholder – implement full‑text search. |
| `content` | `getPopularThreads` | `{ limit? }` | Return threads sorted by view count and recency. |
| `content` | `likePost` | `{ sessionToken, postId }` | Increment the like counter for a post. |

---

## Data Model
The data structures live in `src/server/lib/forum-types.ts` and are persisted as JSON objects via **unstorage**.

* **User** – `id`, `username`, `email`, `passwordHash`, `avatar`, `role`, `postCount`, `lastActive`, `emailVerified`, timestamps.
* **Category** – `id`, `name`, `slug`, `description`, `icon`, `order`, timestamps.
* **Board** – `id`, `categoryId`, `name`, `slug`, `description`, `moderators[]`, counters, timestamps.
* **Thread** – `id`, `boardId`, `title`, `slug`, `authorId`, `authorUsername`, `content`, flags, `postCount`, `viewCount`, `lastPostAt`, `lastPostBy`, timestamps.
* **Post** – `id`, `threadId`, `boardId`, `authorId`, `authorUsername`, `content`, `likes`, `createdAt`, optional edit metadata.

---

## Deployment
### Production Build
```bash
pnpm build   # creates optimized assets in ./dist
pnpm preview # serves the build locally (or deploy the ./dist folder to any static host)
```
The build bundles the server with Vite's SSR support, so you can host the output on any Node.js environment (e.g., Vercel, Railway, Render). Ensure the `PORT` environment variable is set if you change the default.

### Environment Variables
| Variable | Description |
|---|---|
| `PORT` | Port for the Node.js server (default 5173). |
| `NODE_ENV` | `development` or `production`. |
| `SESSION_SECRET` | Secret used to sign session tokens (auto‑generated if omitted). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP credentials for sending verification emails. |
| `BASE_URL` | Public URL of the app (used in email links). |

---

## Styling & Theming
* **Tailwind CSS** – Utility‑first classes, custom color palette (primary teal `#14b8a6`).
* **CSS Variables** – Defined in `src/client/styles/forum.css` for easy theme overrides.
* **Dark Mode** – Enabled via Tailwind's `media` strategy; respects system preference.
* **Icons** – Heroicons React library for consistent UI icons.

---

## Security Considerations
* **Password hashing** – PBKDF2 (`crypto.pbkdf2Sync`) with a per‑user salt.
* **Session tokens** – Randomly generated UUIDs stored server‑side; transmitted via HTTP‑Only cookies.
* **Input validation** – All RPC inputs validated with **Zod** schemas.
* **Rate limiting & CSRF** – Not implemented yet – add middleware in `src/server/routes/rpc.ts` for production.
* **Content sanitization** – Posts are rendered as raw HTML; consider a library like **DOMPurify** to prevent XSS.

---

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome‑feature`).
3. Install dependencies (`pnpm install`).
4. Make your changes – run `pnpm lint:fix` and `pnpm check:types` before committing.
5. Open a Pull Request with a clear description of the change and any relevant screenshots.

All contributions are welcome – from UI tweaks to backend enhancements or documentation improvements.

---

## License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---

## Acknowledgments
* The original **ScooterTalk** community for inspiring this recreation.
* **Hono**, **oRPC**, **Unstorage**, **Tailwind CSS**, **React**, and the countless open‑source contributors behind these tools.
* **Quests** – the development platform that powers this interactive coding environment.

---

**ScooterTalk** – an electric‑scooter community on a mission to stamp out transportation mediocrity. 🛴✨
# trigger redeploy
