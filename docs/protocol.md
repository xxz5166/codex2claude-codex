# Protocol

This project uses a shared-workspace mailbox protocol. Every message is a JSON file stored under `.ai-coop/inbox/<agent>/`.

## Directory layout

- `.ai-coop/inbox/claude/` ? messages waiting for Claude
- `.ai-coop/inbox/codex/` ? messages waiting for Codex
- `.ai-coop/archive/claude/` ? archived Claude-handled messages
- `.ai-coop/archive/codex/` ? archived Codex-handled messages
- `.ai-coop/state/seen/` ? polling state for `watch`
- `.ai-coop/templates/` ? starter templates for common message types

## Message schema

```json
{
  "id": "uuid",
  "kind": "task.request",
  "from": "claude",
  "to": "codex",
  "title": "Human-readable summary",
  "body": "Free-form details",
  "steps": ["step 1", "step 2"],
  "acceptance": ["criterion 1"],
  "files": ["src/file.js"],
  "commands": ["npm test"],
  "replyTo": "optional-message-id",
  "metadata": {},
  "createdAt": "ISO-8601 timestamp",
  "createdAtMs": 1234567890
}
```

## Supported message kinds

- `task.request`
- `task.result`
- `review.request`
- `review.result`
- `split.plan`
- `status.update`

## Recommended conventions

- One message = one atomic task
- `title` should be specific and testable
- `steps` should be executable in order
- `acceptance` should be measurable
- `files` should list likely touch points
- `commands` should include validation commands

## Lifecycle

1. Claude posts a task to Codex.
2. Codex polls inbox messages.
3. Codex implements changes and validates locally.
4. Codex posts a result back to Claude.
5. Claude reviews and, if needed, posts a revision request.
6. Completed messages are archived.
