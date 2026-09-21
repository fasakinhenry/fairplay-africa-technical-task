<!--
  LinkedIn post #1 — the hook post.
  Goal: announce the application + technical task in a way that stops the scroll.
  Suggested: post this alongside a screenshot of the terminal, the /docs (Swagger UI) page,
  or the repo's file tree.
  Remember to swap <REPO_LINK> for your actual GitHub URL before posting.
-->

I applied for a job. They didn't ask for my CV first — they asked for code.

FairPlay Africa's Fullstack Intern role skipped the usual "tell me about yourself" and went straight to:

"Build a simple API architecture that allows a user to register a piece of content and retrieve their registered content."

No boilerplate. No starter repo. Just a sentence — and a chance to show, not tell.

So that's what I did. In the last day I built:

→ A TypeScript + Bun + Express API, layered into routes → controllers → services → repositories
→ PostgreSQL + Prisma for the data layer, with a real migration, not just a schema file
→ JWT auth + bcrypt password hashing, because "register content" only means something once it belongs to someone
→ Zod validation on every input, a centralized error handler, rate limiting, helmet, structured logging
→ An OpenAPI spec served through Swagger UI, so the API documents itself
→ An integration test suite that boots the real server and hits it over HTTP
→ A Dockerfile and a written deployment guide for Render

I could have shipped three files and a "works on my machine." Instead I built it the way I'd want to hand it to a senior developer for review — because that's exactly what's about to happen.

Repo: <REPO_LINK>

If you're hiring for junior/intern fullstack roles and want to see how someone thinks — not just what they can copy-paste — I'd love to talk.

#OpenToWork #FullStackDeveloper #TypeScript #NodeJS #BuildInPublic #TechnicalTask
