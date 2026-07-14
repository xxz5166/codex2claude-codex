# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-14

### Added
- Shared-file mailbox protocol for Claude Code ↔ Codex cooperation
- CLI commands: `init`, `post`, `poll`, `done`, `watch`
- Message types: task.request/result, review.request/result, split.plan, status.update
- Execution brief formatter for both agents
- Template files for task requests and review feedback
- Integration example in `examples/basic-communication.js`
- Test suite with 3 core tests
- MIT License
