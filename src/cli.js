const fs = require('fs');
const path = require('path');
const {
  MessageBus,
  buildExecutionBrief,
  createMessage,
  ensureAgent,
  readBody,
  replyKindFor,
  splitList
} = require('./index');

function parseArgs(argv) {
  const result = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      result._.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      result[key] = true;
      continue;
    }

    result[key] = next;
    index += 1;
  }

  return result;
}

function printUsage() {
  console.log([
    'Claude Code + Codex cooperative mailbox',
    '',
    'Usage:',
    '  codex2claude init',
    '  codex2claude post --from claude --to codex --title "..." [--kind task.request]',
    '  codex2claude poll --agent codex [--json] [--writeBrief path]',
    '  codex2claude watch --agent codex [--interval 60]',
    '  codex2claude done --agent codex --id <message-id> --summary "..."',
    '  codex2claude --version',
    ''
  ].join('\n'));
}

function printMessage(entry) {
  const { message } = entry;
  console.log('='.repeat(80));
  console.log(buildExecutionBrief(message));
}

function writeBrief(target, message) {
  const absoluteTarget = path.resolve(process.cwd(), target);
  fs.mkdirSync(path.dirname(absoluteTarget), { recursive: true });
  fs.writeFileSync(absoluteTarget, buildExecutionBrief(message), 'utf8');
  return absoluteTarget;
}

function runInit(bus) {
  bus.init();
  console.log(`Initialized cooperative mailbox at ${bus.baseDir}`);
}

function runPost(bus, args) {
  const body = readBody(args.body, args.bodyFile);
  const message = createMessage({
    from: args.from,
    to: args.to,
    kind: args.kind || 'task.request',
    title: args.title,
    body,
    steps: splitList(args.steps),
    acceptance: splitList(args.acceptance),
    files: splitList(args.files),
    commands: splitList(args.commands),
    replyTo: args.replyTo
  });

  const target = bus.post(message);
  console.log(`Posted ${message.kind} from ${message.from} to ${message.to}`);
  console.log(`Message ID: ${message.id}`);
  console.log(`Saved to: ${target}`);
}

function runPoll(bus, args) {
  ensureAgent(args.agent, 'agent');
  const entries = bus.list(args.agent);

  if (entries.length === 0) {
    console.log(`No pending messages for ${args.agent}`);
    return;
  }

  if (args.json) {
    console.log(JSON.stringify(entries.map((entry) => entry.message), null, 2));
    return;
  }

  for (const entry of entries) {
    printMessage(entry);
  }

  if (args.writeBrief) {
    const target = writeBrief(args.writeBrief, entries[0].message);
    console.log(`Wrote brief to ${target}`);
  }
}

function runDone(bus, args) {
  ensureAgent(args.agent, 'agent');
  if (!args.id) {
    throw new Error('id is required');
  }

  if (!args.summary) {
    throw new Error('summary is required');
  }

  const entry = bus.get(args.agent, args.id);
  if (!entry) {
    throw new Error(`Message ${args.id} not found in ${args.agent} inbox`);
  }

  const original = entry.message;
  const reply = createMessage({
    from: args.agent,
    to: original.from,
    kind: replyKindFor(original.kind),
    title: `Re: ${original.title}`,
    body: args.body || args.summary,
    steps: [],
    acceptance: splitList(args.acceptance),
    files: splitList(args.files),
    commands: splitList(args.commands),
    replyTo: original.id,
    metadata: {
      summary: args.summary,
      completedBy: args.agent
    }
  });

  const archivedTo = bus.archive(args.agent, args.id);
  const postedTo = bus.post(reply);

  console.log(`Archived ${original.id} to ${archivedTo}`);
  console.log(`Posted reply ${reply.id} to ${postedTo}`);
}

function runWatch(bus, args) {
  ensureAgent(args.agent, 'agent');
  const intervalSeconds = Number(args.interval || 60);
  if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
    throw new Error('interval must be a positive number of seconds');
  }

  const tick = () => {
    const unseen = bus.unseen(args.agent);
    if (unseen.length === 0) {
      console.log(`[${new Date().toISOString()}] No new messages for ${args.agent}`);
      return;
    }

    for (const entry of unseen) {
      console.log(`[${new Date().toISOString()}] New message for ${args.agent}`);
      printMessage(entry);
      bus.markSeen(args.agent, entry.message.id);
    }
  };

  console.log(`Watching ${args.agent} inbox every ${intervalSeconds} seconds at ${bus.agentInbox(args.agent)}`);
  tick();
  setInterval(tick, intervalSeconds * 1000);
}

function main() {
  const bus = new MessageBus({ rootDir: process.cwd() });
  bus.init();

  const command = process.argv[2];
  const args = parseArgs(process.argv.slice(3));

  if (!command || command === 'help' || command === '--help' || args.help) {
    printUsage();
    return;
  }

  if (command === '--version' || command === '-v' || args.version) {
    const { version } = require('../package.json');
    console.log(version);
    return;
  }

  switch (command) {
    case 'init':
      runInit(bus);
      break;
    case 'post':
      runPost(bus, args);
      break;
    case 'poll':
      runPoll(bus, args);
      break;
    case 'done':
      runDone(bus, args);
      break;
    case 'watch':
      runWatch(bus, args);
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
