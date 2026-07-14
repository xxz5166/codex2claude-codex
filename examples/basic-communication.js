const fs = require('fs');
const os = require('os');
const path = require('path');

const { MessageBus, buildExecutionBrief, createMessage } = require('../src');

const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'codex2claude-example-'));
const bus = new MessageBus({ rootDir: workspace });

bus.init();

const request = createMessage({
  from: 'claude',
  to: 'codex',
  kind: 'task.request',
  title: 'Implement shared task protocol',
  body: 'Create a structured mailbox that Claude and Codex can both use.',
  steps: ['Initialize the mailbox layout', 'Define the message protocol', 'Add poll and done commands'],
  acceptance: ['Claude can post tasks', 'Codex can poll tasks', 'Codex can reply with results'],
  files: ['src/index.js', 'src/communication/message-bus.js'],
  commands: ['npm test']
});

bus.post(request);

const [next] = bus.list('codex');

console.log(`Workspace: ${workspace}`);
console.log('Pending message for Codex:');
console.log(buildExecutionBrief(next.message));
