# Deploying to Render

This guide walks through deploying this API to [Render](https://render.com) using its managed PostgreSQL database and a Docker-based web service (the most reliable path for a Bun app, since Render's native Node environment doesn't ship Bun by default).

## 1. Push the repo to GitHub

Render deploys from a Git repository, so make sure this project is pushed to GitHub (or GitLab/Bitbucket) first.

## 2. Create a PostgreSQL database on Render

1. In the Render dashboard, click **New +** → **PostgreSQL**.
2. Give it a name (e.g. `fairplay-content-db`), pick the free plan for this task, and create it.
3. Once it's provisioned, open the database and copy the **Internal Database URL** (you'll use the internal URL if your web service is also on Render, for lower latency and no external network hop) — or the **External Database URL** if connecting from outside Render.

## 3. Create the web service

1. Click **New +** → **Web Service**.
2. Connect the GitHub repository for this project.
3. Under **Environment**, choose **Docker** — Render will detect the `Dockerfile` at the repo root and build from it automatically. No build/start command needed; they're defined in the `Dockerfile`.
4. Choose an instance type (the free tier works for demoing this task).

## 4. Configure environment variables

On the web service's **Environment** tab, add:

| Key                     | Value                                                              |
| ------------------------ | ------------------------------------------------------------------ |
| `DATABASE_URL`            | The Postgres connection string from step 2                        |
| `JWT_SECRET`              | A long random string (e.g. generate with `openssl rand -hex 32`)  |
| `JWT_EXPIRES_IN`          | `1d` (or your preference)                                          |
| `NODE_ENV`                | `production`                                                       |
| `PORT`                    | `4000` (Render sets its own `PORT` too; see note below)             |
| `RATE_LIMIT_WINDOW_MS`    | `900000`                                                            |
| `RATE_LIMIT_MAX`          | `100`                                                               |

> **Note on `PORT`:** Render injects its own `PORT` environment variable and expects your service to listen on it. This app already reads `process.env.PORT` via `src/config/env.ts`, so it will automatically bind to whatever port Render provides — you don't strictly need to set `PORT` yourself, but it's listed above for local/other-host clarity.

## 5. Deploy

Click **Create Web Service**. Render will:

1. Build the Docker image (`bun install`, `prisma generate`).
2. Run the container's `CMD`, which runs `prisma migrate deploy` (applying any pending migrations against the database from `DATABASE_URL`) and then starts the server.

Watch the deploy logs — you should see:

```
🚀 API listening on port <PORT> (production)
📚 API docs available at http://localhost:<PORT>/docs
```

## 6. Verify

Once deployed, Render gives you a public URL like `https://fairplay-africa-technical-task.onrender.com`. Verify with:

```bash
curl https://<your-service>.onrender.com/health
# => {"status":"ok","uptime":...}
```

Visit `https://<your-service>.onrender.com/docs` for interactive API documentation.

## Applying future schema changes

Whenever `prisma/schema.prisma` changes, create a migration locally and commit it:

```bash
bunx prisma migrate dev --name <describe-the-change>
git add prisma/migrations
git commit -m "feat(db): <describe the change>"
git push
```

Render will apply pending migrations automatically on the next deploy, since the container's start command runs `prisma migrate deploy` before starting the server.

## Alternative: Render's native (non-Docker) runtime

If you'd rather not use Docker, Render's native Node environment can still run Bun by installing it during the build step:

- **Build Command:** `curl -fsSL https://bun.sh/install | bash && ~/.bun/bin/bun install && ~/.bun/bin/bunx prisma generate`
- **Start Command:** `~/.bun/bin/bunx prisma migrate deploy && ~/.bun/bin/bun run src/index.ts`

The Docker approach documented above is recommended since it pins the exact Bun version and avoids re-installing Bun's binary on every cold build.
