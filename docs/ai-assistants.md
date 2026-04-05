# Local AI Helpers

This project now has a small local AI helper layer that uses your own OpenAI and Anthropic keys from local env files.

Important:

- the keys stay local and are never bundled into client-side code
- the helpers do not rewrite project files automatically
- by default they only print analysis or JSON drafts to stdout
- writing to a file happens only when you pass `--write`

## Supported env files

The scripts load variables from these files when present:

- `.env`
- `.env.local`
- `.env.ai`
- `.env.ai.local`

Recommended variables:

```env
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

## Commands

### Analyze code

Use for architecture review, bug hunting, or API-readiness checks on specific files or folders.

```bash
npm run ai:analyze -- src/components/center/LessonView.tsx
```

Custom prompt:

```bash
npm run ai:analyze -- src/lib/apiClient.ts --prompt "Check this file for auth edge cases and API contract risks"
```

Optional flags:

- `--provider openai|anthropic`
- `--model <model-name>`
- `--write docs/analysis/api-client.md`

### Review current git diff

Use for a second opinion before commit or PR.

```bash
npm run ai:review-diff
```

Review staged changes only:

```bash
npm run ai:review-diff -- --staged
```

Review against another ref:

```bash
npm run ai:review-diff -- --ref origin/main
```

Optional flags:

- `--provider openai|anthropic`
- `--model <model-name>`
- `--write docs/reviews/current-diff.md`

### Generate quiz JSON draft

Use for fast draft generation from the existing lesson content.

```bash
npm run ai:generate-quiz -- --page 1
```

Save to a file:

```bash
npm run ai:generate-quiz -- --page 2 --write docs/quiz-drafts/quiz-page-2.json
```

Optional flags:

- `--provider openai|anthropic`
- `--model <model-name>`

The output is validated locally against the existing quiz schema before printing.

## Recommended usage pattern

Best split of responsibilities:

- `Anthropic / Claude`
  - long-form analysis
  - architecture and code review
  - reasoning over larger file context

- `OpenAI`
  - structured JSON output
  - quiz drafts
  - tightly formatted helper results

## How we should work with it

Recommended flow when you ask me to use the helpers:

1. I choose the smallest useful AI task.
2. I run the local helper with your env-backed keys.
3. I review the output instead of trusting it blindly.
4. I integrate only the parts that make sense.
5. We still verify with `lint`, `test`, `build`, and preview checks.

This keeps the models useful without letting them silently rewrite the app.
