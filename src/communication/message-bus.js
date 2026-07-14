const fs = require('fs');
const path = require('path');

class MessageBus {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.baseDir = path.join(this.rootDir, '.ai-coop');
    this.inboxDir = path.join(this.baseDir, 'inbox');
    this.archiveDir = path.join(this.baseDir, 'archive');
    this.stateDir = path.join(this.baseDir, 'state');
    this.seenDir = path.join(this.stateDir, 'seen');
    this.templatesDir = path.join(this.baseDir, 'templates');
  }

  init() {
    for (const target of [
      this.baseDir,
      this.inboxDir,
      this.archiveDir,
      this.stateDir,
      this.seenDir,
      this.templatesDir,
      this.agentInbox('claude'),
      this.agentInbox('codex'),
      this.agentArchive('claude'),
      this.agentArchive('codex')
    ]) {
      fs.mkdirSync(target, { recursive: true });
    }

    this.writeTemplate(
      'task-request.md',
      [
        '# Task Request',
        '',
        '## Goal',
        '- What should Codex implement?',
        '',
        '## Context',
        '- Relevant files, commands, constraints',
        '',
        '## Steps',
        '1. ...',
        '',
        '## Acceptance',
        '- ...'
      ].join('\n')
    );

    this.writeTemplate(
      'review-feedback.md',
      [
        '# Review Feedback',
        '',
        '## Findings',
        '- What should change?',
        '',
        '## Requested Fix',
        '- ...',
        '',
        '## Acceptance',
        '- ...'
      ].join('\n')
    );
  }

  writeTemplate(fileName, content) {
    const target = path.join(this.templatesDir, fileName);
    if (!fs.existsSync(target)) {
      fs.writeFileSync(target, content, 'utf8');
    }
  }

  agentInbox(agent) {
    return path.join(this.inboxDir, agent);
  }

  agentArchive(agent) {
    return path.join(this.archiveDir, agent);
  }

  post(message) {
    const fileName = this.fileNameFor(message);
    const target = path.join(this.agentInbox(message.to), fileName);
    fs.writeFileSync(target, JSON.stringify(message, null, 2), 'utf8');
    return target;
  }

  fileNameFor(message) {
    return `${message.createdAtMs}-${message.id}.json`;
  }

  list(agent) {
    const dir = this.agentInbox(agent);
    if (!fs.existsSync(dir)) {
      return [];
    }

    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith('.json'))
      .sort()
      .map((file) => ({
        file,
        fullPath: path.join(dir, file),
        message: JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
      }));
  }

  get(agent, id) {
    return this.list(agent).find((entry) => entry.message.id === id);
  }

  archive(agent, id) {
    const entry = this.get(agent, id);
    if (!entry) {
      return null;
    }

    const target = path.join(this.agentArchive(agent), entry.file);
    fs.renameSync(entry.fullPath, target);
    return target;
  }

  seenFile(agent) {
    return path.join(this.seenDir, `${agent}.json`);
  }

  loadSeen(agent) {
    const target = this.seenFile(agent);
    if (!fs.existsSync(target)) {
      return new Set();
    }

    const ids = JSON.parse(fs.readFileSync(target, 'utf8'));
    return new Set(ids);
  }

  saveSeen(agent, ids) {
    fs.writeFileSync(this.seenFile(agent), JSON.stringify([...ids], null, 2), 'utf8');
  }

  markSeen(agent, id) {
    const ids = this.loadSeen(agent);
    ids.add(id);
    this.saveSeen(agent, ids);
  }

  unseen(agent) {
    const seen = this.loadSeen(agent);
    return this.list(agent).filter((entry) => !seen.has(entry.message.id));
  }
}

module.exports = MessageBus;
