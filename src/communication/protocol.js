const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const AGENTS = ['claude', 'codex'];
const KINDS = [
  'task.request',
  'task.result',
  'review.request',
  'review.result',
  'split.plan',
  'status.update'
];

function ensureAgent(agent, fieldName) {
  if (!AGENTS.includes(agent)) {
    throw new Error(`${fieldName} must be one of: ${AGENTS.join(', ')}`);
  }
}

function ensureKind(kind) {
  if (!KINDS.includes(kind)) {
    throw new Error(`kind must be one of: ${KINDS.join(', ')}`);
  }
}

function splitList(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function readBody(body, bodyFile, cwd = process.cwd()) {
  if (bodyFile) {
    return fs.readFileSync(path.resolve(cwd, bodyFile), 'utf8').trim();
  }

  return body || '';
}

function createMessage(input) {
  const from = input.from;
  const to = input.to;
  const kind = input.kind || 'task.request';
  const title = input.title;

  ensureAgent(from, 'from');
  ensureAgent(to, 'to');
  ensureKind(kind);

  if (!title) {
    throw new Error('title is required');
  }

  const now = new Date();
  return {
    id: crypto.randomUUID(),
    kind,
    from,
    to,
    title,
    body: input.body || '',
    steps: Array.isArray(input.steps) ? input.steps : [],
    acceptance: Array.isArray(input.acceptance) ? input.acceptance : [],
    files: Array.isArray(input.files) ? input.files : [],
    commands: Array.isArray(input.commands) ? input.commands : [],
    replyTo: input.replyTo || null,
    metadata: input.metadata || {},
    createdAt: now.toISOString(),
    createdAtMs: now.getTime()
  };
}

function replyKindFor(kind) {
  if (kind === 'task.request' || kind === 'split.plan') {
    return 'task.result';
  }

  if (kind === 'review.request') {
    return 'review.result';
  }

  return 'status.update';
}

module.exports = {
  AGENTS,
  KINDS,
  createMessage,
  ensureAgent,
  ensureKind,
  readBody,
  replyKindFor,
  splitList
};
