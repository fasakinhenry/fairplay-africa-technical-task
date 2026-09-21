<!--
  LinkedIn post #2 — the thought-process / build-in-public post.
  Goal: show how you think about tradeoffs, not just that you can write code.
  Post this a day or two after post #1, ideally with a screenshot of the folder
  structure or the OpenAPI docs page.
  Remember to swap <REPO_LINK> for your actual GitHub URL before posting.
-->

"Build a simple API that lets a user register and retrieve content."

One sentence. Here's what actually went through my head before I wrote a single line.

**1. What does "simple" actually mean here?**
Simple doesn't mean thin. It means no wasted complexity — every piece earns its place. So before touching code, I asked: what's the smallest model that makes the task's own words true? "Retrieve their registered content" implies ownership. Ownership implies a user. So a minimal User model wasn't scope creep — it was the one addition required for the sentence to make sense.

**2. Where do I draw the line on scope?**
It was tempting to add update/delete endpoints, tags, search, soft deletes. I didn't. The brief asked for register + retrieve. I added pagination and filtering to "retrieve" because a list of one item isn't a realistic retrieval story — but I stopped there. Knowing what *not* to build is as much a signal as knowing what to build.

**3. What would a senior developer actually check first?**
Not the happy path. So I made sure:
- Every input is validated (Zod) before it touches business logic
- Every thrown error lands in one place (a single error-handling middleware), not scattered try/catches
- A user requesting someone else's content by ID gets a 404, not a 403 — so the response itself doesn't confirm the content exists
- Passwords are hashed, never logged, never returned in any response

**4. How do I prove it actually works, not just "looks right"?**
Integration tests that boot the real Express app on a real port and hit it with plain fetch — the same way a real client would. Not mocked-to-death unit tests that pass while the wiring underneath is broken.

**5. What happens after I stop working on it?**
This is the question I think most technical tests miss. I wrote a full OpenAPI spec served at /docs, a README that explains *why* each decision was made (not just what the code does), and a step-by-step Render deployment guide — because "it runs on my machine" isn't the bar. "Someone else can pick this up cold" is.

The stack — TypeScript, Bun, Express, PostgreSQL, Prisma, JWT — was chosen to mirror FairPlay Africa's own job description, not because it's what I reach for by default. Matching the team you're joining is part of the task, even when it isn't written down.

Repo, architecture notes, and full API docs here: <REPO_LINK>

#SoftwareEngineering #APIDesign #TypeScript #BackendDevelopment #InternshipJourney
