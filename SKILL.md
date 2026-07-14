---
name: codex2claude
description: Use when coordinating Claude Code and Codex through the shared workspace mailbox protocol.
---

# Claude Code + Codex Cooperative Mailbox

Use this repository when you want a lightweight, file-based workflow for cross-agent collaboration.

## When to use

- Claude should plan, split, or review work.
- Codex should execute tasks, fix bugs, and report results.
- Both agents need a durable shared inbox in the same workspace.

## Operating rules

1. Initialize the mailbox with `npm run coop:init`.
2. Claude writes `task.request` messages to `.ai-coop/inbox/codex/`.
3. Codex polls with `npm run coop:poll:codex` or `npm run coop:watch:codex`.
4. Codex responds with `task.result`, `review.result`, or `status.update`.
5. Claude reviews the reply and either approves or sends follow-up work.

## Message quality rules

- One message should describe one task.
- Include file paths, steps, validation commands, and acceptance criteria.
- Split large work into smaller subtasks before assigning it.
- Keep all work auditable in the repository.

## Quick commands

- `npm run coop:init`
- `npm run coop:poll:codex`
- `npm run coop:watch:codex`
- `npm run coop:poll:claude`
- `npm test`
