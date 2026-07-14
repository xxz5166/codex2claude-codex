const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const packageEntry = require('../src');
const MessageBus = require('../src/communication/message-bus');
const { createMessage } = require('../src/communication/protocol');

function createWorkspace() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'codex2claude-'));
}

test('package entry exports the public API', () => {
  assert.equal(typeof packageEntry.MessageBus, 'function');
  assert.equal(typeof packageEntry.createMessage, 'function');
  assert.equal(typeof packageEntry.buildExecutionBrief, 'function');
  assert.equal(typeof packageEntry.buildStructuredRequest, 'function');
});

test('init creates the cooperative mailbox layout', () => {
  const rootDir = createWorkspace();
  const bus = new MessageBus({ rootDir });

  bus.init();

  assert.equal(fs.existsSync(path.join(rootDir, '.ai-coop', 'inbox', 'claude')), true);
  assert.equal(fs.existsSync(path.join(rootDir, '.ai-coop', 'inbox', 'codex')), true);
  assert.equal(fs.existsSync(path.join(rootDir, '.ai-coop', 'archive', 'claude')), true);
  assert.equal(fs.existsSync(path.join(rootDir, '.ai-coop', 'templates', 'task-request.md')), true);
});

test('post stores a message in the recipient inbox', () => {
  const rootDir = createWorkspace();
  const bus = new MessageBus({ rootDir });
  bus.init();

  const message = createMessage({
    from: 'claude',
    to: 'codex',
    kind: 'task.request',
    title: 'Implement auth',
    body: 'Create the login flow.',
    steps: ['Read existing auth code'],
    acceptance: ['Tests pass']
  });

  bus.post(message);

  const inbox = bus.list('codex');
  assert.equal(inbox.length, 1);
  assert.equal(inbox[0].message.title, 'Implement auth');
});

test('archive moves a handled message out of inbox', () => {
  const rootDir = createWorkspace();
  const bus = new MessageBus({ rootDir });
  bus.init();

  const message = createMessage({
    from: 'claude',
    to: 'codex',
    kind: 'task.request',
    title: 'Fix bug',
    body: 'Repair the failing endpoint.'
  });

  bus.post(message);
  const archived = bus.archive('codex', message.id);

  assert.ok(archived.includes(path.join('.ai-coop', 'archive', 'codex')));
  assert.equal(bus.list('codex').length, 0);
});
