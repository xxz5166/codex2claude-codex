const MessageBus = require('./communication/message-bus');
const protocol = require('./communication/protocol');
const { buildExecutionBrief } = require('./agents/codex-agent');
const { buildStructuredRequest } = require('./agents/claude-agent');

module.exports = {
  MessageBus,
  buildExecutionBrief,
  buildStructuredRequest,
  ...protocol
};

if (require.main === module) {
  require('./cli');
}
