# Claude Code + Codex Cooperative Mailbox

A lightweight, file-based protocol for running Claude Code inside the Codex terminal and coordinating both agents in the same workspace.

## What this project is

This repository provides a simple shared-workspace mailbox so Claude Code and Codex can collaborate without extra infrastructure.

### Goals

- **Simple to deploy**: no server, no daemon, no database
- **Easy to audit**: every message is stored as a JSON file in the workspace
- **Bidirectional**: both agents can post, poll, reply, and review
- **Open-source friendly**: CLI-first and easy to publish on GitHub

## Why this approach

For your workflow, the best tradeoff is a shared workspace mailbox:

- Claude Code already runs inside Codex's terminal
- both agents can see the same filesystem
- messages are durable and recoverable
- polling is easy to automate
- it avoids hidden state and extra services

## Install

```bash
npm install
npm run coop:init
```

## Quick start

Send a task from Claude to Codex:

```bash
npx codex2claude post \
  --from claude \
  --to codex \
  --kind task.request \
  --title "Implement login endpoint" \
  --body "Add /api/login with email + password validation." \
  --steps "Read existing auth code|Implement endpoint|Add tests|Verify locally" \
  --acceptance "Returns token on success|Returns 401 on failure|Tests pass" \
  --files "src/auth.js|src/routes/login.js|tests/auth.test.js" \
  --commands "npm test"
```

Poll Codex messages manually:

```bash
npx codex2claude poll --agent codex
```

Or keep polling every minute:

```bash
npx codex2claude watch --agent codex --interval 60
```

When a task is complete:

```bash
npx codex2claude done \
  --agent codex \
  --id <message-id> \
  --summary "Implemented and verified" \
  --body "Added the endpoint, tests, and local validation." \
  --files "src/auth.js|src/routes/login.js|tests/auth.test.js" \
  --commands "npm test"
```

## Repository layout

```text
.ai-coop/
  inbox/
    claude/
    codex/
  archive/
    claude/
    codex/
  state/
    seen/
  templates/
    task-request.md
    review-feedback.md
```

## Commands

| Command | Description |
| --- | --- |
| `init` | Create the `.ai-coop` folder structure and templates. |
| `post` | Write a structured message to another agent's inbox. |
| `poll` | Read pending messages for an agent. |
| `watch` | Poll continuously at a fixed interval. |
| `done` | Archive a handled task and post a reply. |

## Message kinds

- `task.request` - Claude assigns work to Codex
- `task.result` - Codex reports implementation results
- `review.request` - Claude asks for code review or revision
- `review.result` - Codex returns review findings or fixes
- `split.plan` - Claude splits a large task into smaller subtasks
- `status.update` - Status note from either side

## Recommended workflow

1. Claude writes a precise task request.
2. Codex polls the inbox and executes the task.
3. Codex posts a result with changed files, commands, and blockers.
4. Claude reviews the result and either approves or sends follow-up work.
5. Repeat until the task is done.

## Prompt files

Use the files in `prompts/` as starting prompts for each agent:

- `prompts/claude-bootstrap.md`
- `prompts/codex-bootstrap.md`
- `prompts/review-template.md`

## Skill vs plugin

This repository is optimized as a **skill-friendly CLI workflow**, not a plugin-first integration.

- **Skill**: best for a portable, lightweight operating protocol
- **Plugin**: best for deeper Codex UI integration, but heavier to distribute

For your use case, the CLI + shared workspace protocol is the core. A skill wrapper is optional.

## Publishing checklist

Before pushing to GitHub:

1. Run `npm test`
2. Run `node src/cli.js --help`
3. Run `npm pack --dry-run`
4. Commit the generated workflow and docs
5. Push to your GitHub repository

## Development

```bash
npm test
node src/cli.js --help
node src/cli.js --version
```

## License

MIT

---

# 中文文档

Claude Code 与 Codex 的共享邮箱协作协议。

这是一个轻量级的文件协议，让 Claude Code 和 Codex 在同一工作区内无需额外基础设施即可协作。

## 为什么选择这种方式

- 两边都已经在同一工作目录里
- Claude 的对话和命令输出本来就在 Codex 可视范围
- 文件协议天然可审计、可追溯、可恢复
- 不依赖长期后台服务，掉线后也不会丢任务

## 安装

```bash
npm install
npm run coop:init
```

## 快速开始

Claude 向 Codex 发送任务：

```bash
npx codex2claude post \
  --from claude \
  --to codex \
  --kind task.request \
  --title "实现登录接口" \
  --body "新增 /api/login，支持邮箱+密码验证" \
  --steps "先阅读 auth 模块|补接口|补测试|本地验证" \
  --acceptance "接口返回 token|失败时返回 401|测试通过" \
  --files "src/auth.js|src/routes/login.js|tests/auth.test.js" \
  --commands "npm test"
```

手动轮询 Codex 的消息：

```bash
npx codex2claude poll --agent codex
```

或者每分钟自动轮询：

```bash
npx codex2claude watch --agent codex --interval 60
```

任务完成后回传结果：

```bash
npx codex2claude done \
  --agent codex \
  --id <message-id> \
  --summary "登录接口已完成并通过本地测试" \
  --body "补充了输入校验、token 生成和错误处理" \
  --files "src/auth.js|src/routes/login.js|tests/auth.test.js" \
  --commands "npm test"
```

## 消息类型

- `task.request` — Claude 给 Codex 的执行任务
- `task.result` — Codex 回传结果
- `review.request` — Claude 发起审查
- `review.result` — Codex 回复审查结果
- `split.plan` — 任务拆分计划
- `status.update` — 状态同步

## 推荐工作流

1. Claude 写出明确的任务请求
2. Codex 轮询收件箱并执行任务
3. Codex 回传结果、改动文件和验证信息
4. Claude 审查结果，批准或发送修订意见
5. 循环直到任务完成

## 命令说明

| 命令 | 描述 |
| --- | --- |
| `init` | 创建 `.ai-coop` 目录结构和模板 |
| `post` | 向另一个 agent 的收件箱写入消息 |
| `poll` | 读取某个 agent 的待处理消息 |
| `watch` | 按固定间隔持续轮询 |
| `done` | 归档已处理的消息并自动回复 |

## 许可证

MIT
