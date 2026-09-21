# FairPlay Africa: Content Registration API

A simple, production-minded REST API that lets a user create an account, **register a piece of content**, and **retrieve the content they've registered**, built as the technical task for the FairPlay Africa Fullstack Intern application.

The brief was intentionally small ("build a simple API architecture that allows a user to register a piece of content and retrieve their registered content"), so the goal here wasn't to over-build. It was to show how I structure, secure, document and test a real backend service when given a blank slate.

## Tech stack

Chosen to match the stack listed in the FairPlay Africa job description:

| Concern            | Choice                                                      |
| ------------------ | ------------------------------------------------------------ |
| Language           | TypeScript (strict mode)                                    |
| Runtime / tooling  | [Bun](https://bun.sh): package manager, dev server, test runner |
| HTTP framework     | Express 4                                                    |
| Database           | PostgreSQL                                                   |
| ORM                | Prisma                                                       |
| Validation         | Zod                                                          |
| Auth               | JWT (access token) + bcrypt password hashing                 |
| API docs           | OpenAPI 3 spec, served via Swagger UI at `/docs`              |
| Logging            | Pino (structured JSON logs)                                  |
| Tests              | Bun's built-in test runner (integration tests over real HTTP) |

## Why a user has to exist first

"Register a piece of content" only means something if content belongs to *someone*. Rather than bolt an ownership field onto an anonymous content table, this API models a minimal `User` and ties every `Content` record to its owner via a foreign key. That's the one piece of scope I added beyond the literal task description, because it's the smallest addition that makes "retrieve **their** registered content" true instead of "retrieve all content."

## Architecture

The code is organized in layers so each piece has exactly one job and can be tested or swapped independently:

```
src/
  config/        env loading + validation (zod-checked at boot, fails fast if misconfigured)
  db/            Prisma client singleton
  middleware/    auth guard, request validation, centralized error handling
  modules/
    auth/        routes -> controller -> service  (register / login)
    content/     routes -> controller -> service -> repository  (create / list / get-by-id)
  types/         shared/ambient TypeScript types
  utils/         jwt, password hashing, ApiError, asyncHandler
  app.ts         express app assembly (middleware, routers, docs, error handlers)
  index.ts       process entrypoint + graceful shutdown
prisma/
  schema.prisma  User + Content models
docs/
  openapi.yaml   API contract, served at /docs
  DEPLOYMENT.md  step-by-step Render deployment guide
tests/
  auth.test.ts, content.test.ts   integration tests against a real running instance of the app
posts/
  linkedin posts written about doing this task
```

**Request flow:** `router -> validate middleware (zod) -> [auth middleware] -> controller -> service (business rules) -> repository (Prisma) -> database`. Controllers stay thin (parse request, call service, shape response); services own the business rules (e.g. "you can only ever see your own content"); repositories are the only files that know about Prisma.

**Error handling:** every thrown `ApiError` (or Prisma known-error, e.g. a unique constraint violation) is caught by a single `errorHandler` and turned into a consistent `{ error: { message, details? } }` JSON shape with the right status code. There are no scattered try/catch blocks in controllers, since `asyncHandler` forwards rejected promises to it automatically.

**Security defaults:** `helmet` for HTTP headers, `cors`, a rate limiter, bcrypt-hashed passwords (never stored or returned in plaintext), JWTs signed with a server-only secret, and content lookups return `404` (not `403`) for another user's content so ownership isn't leaked through the status code.

## Data model

```
User          Content
------        -------
id (uuid)     id (uuid)
name           title
email (unique) description?
passwordHash   type (ARTICLE | VIDEO | IMAGE | AUDIO | OTHER)
createdAt      url?
updatedAt      ownerId -> User.id
               createdAt
               updatedAt
```

## API summary

Full interactive documentation (request/response schemas, try-it-out) lives at **`/docs`** once the server is running. Summary:

| Method | Path             | Auth | Description                                  |
| ------ | ---------------- | ---- | --------------------------------------------- |
| POST   | `/api/auth/register` | ✕ | Create an account, returns a JWT              |
| POST   | `/api/auth/login`    | ✕ | Authenticate, returns a JWT                   |
| POST   | `/api/content`       | ✓ | **Register** a piece of content               |
| GET    | `/api/content`       | ✓ | **Retrieve** the caller's content (paginated, filterable by `type`) |
| GET    | `/api/content/:id`   | ✓ | **Retrieve** a single piece of content by id  |
| GET    | `/health`            | ✕ | Liveness check                                |

Authenticated routes expect `Authorization: Bearer <token>`.

### Example: register a user, then register and retrieve content

```bash
# 1. Register a user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"supersecret1"}'
# => { "user": { "id": "...", "name": "...", "email": "..." }, "token": "..." }

# 2. Register a piece of content (use the token from step 1)
curl -X POST http://localhost:4000/api/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"My first article","type":"ARTICLE","url":"https://example.com/post"}'

# 3. Retrieve your registered content
curl http://localhost:4000/api/content \
  -H "Authorization: Bearer <token>"
```

## Getting started locally

### Prerequisites

- [Bun](https://bun.sh) >= 1.1
- A PostgreSQL database (local install, Docker, or a free instance from [Neon](https://neon.tech)/[Supabase](https://supabase.com)/Render)

### Setup

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.example .env
# edit .env: set DATABASE_URL to your Postgres connection string,
# and JWT_SECRET to a long random string

# 3. Generate the Prisma client and run migrations
bunx prisma generate
bunx prisma migrate dev --name init

# 4. Start the dev server (hot reload)
bun run dev
```

The API will be available at `http://localhost:4000`, with docs at `http://localhost:4000/docs`.

### Scripts

| Command                  | Purpose                                      |
| ------------------------ | --------------------------------------------- |
| `bun run dev`             | Start the API with hot reload                 |
| `bun run start`           | Start the API (no watch)                      |
| `bun run typecheck`       | Type-check the whole project (`tsc --noEmit`) |
| `bun run lint`            | Lint `src` and `tests`                        |
| `bun run test`            | Run the integration test suite                |
| `bun run prisma:studio`   | Open Prisma Studio to browse the database     |

### Running the tests

The test suite boots the real Express app on an ephemeral port and drives it over plain `fetch`, so it needs a real (ideally disposable/test) Postgres database configured via `DATABASE_URL`:

```bash
bunx prisma migrate deploy
bun run test
```

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for a step-by-step guide to deploying this API on [Render](https://render.com).

## Design decisions & trade-offs

- **Express over Fastify/NestJS:** the most widely known Node framework, so the architecture (not framework-specific idioms) is what gets evaluated. The layered structure would port to either with minimal change.
- **Prisma over a raw query builder:** type-safe queries, migrations, and a schema that doubles as documentation of the data model, at the cost of an extra generation step (`prisma generate`).
- **JWT over sessions:** no server-side session store to run/scale for a task this size; a stateless token is the simplest correct choice.
- **404 instead of 403 on cross-user content access:** a deliberate choice to avoid confirming a resource's existence to a user who doesn't own it.
- **No delete/update endpoints:** the task asked for register + retrieve; I added list pagination and filtering because "retrieve" implied more than one item, but held the line at scope creep beyond that.

---

> Made with 💖 by [Fasakin Henry](https://github.com/fasakinhenry)
