function buildStructuredRequest(input) {
  return {
    title: input.title,
    body: input.body,
    steps: input.steps || [],
    acceptance: input.acceptance || [],
    files: input.files || [],
    commands: input.commands || []
  };
}

module.exports = {
  buildStructuredRequest
};
