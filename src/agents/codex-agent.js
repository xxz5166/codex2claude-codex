function formatSection(title, items) {
  if (!items || items.length === 0) {
    return '';
  }

  return `${title}\n${items.map((item, index) => `${index + 1}. ${item}`).join('\n')}\n`;
}

function buildExecutionBrief(message) {
  const parts = [
    `# ${message.title}`,
    '',
    `- Type: ${message.kind}`,
    `- From: ${message.from}`,
    `- Message ID: ${message.id}`,
    `- Created: ${message.createdAt}`,
    message.replyTo ? `- Reply To: ${message.replyTo}` : null,
    '',
    '## Body',
    message.body || '(empty)',
    ''
  ].filter(Boolean);

  const steps = formatSection('## Steps', message.steps);
  const acceptance = formatSection('## Acceptance', message.acceptance);
  const files = formatSection('## Files', message.files);
  const commands = formatSection('## Commands', message.commands);

  return [parts.join('\n'), steps, acceptance, files, commands]
    .filter(Boolean)
    .join('\n');
}

module.exports = {
  buildExecutionBrief
};
