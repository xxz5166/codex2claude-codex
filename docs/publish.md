# Publishing to GitHub

Use these commands after you are ready to publish this repository.

## First-time publish

```bash
git init
git add .
git commit -m "feat: publish Claude + Codex cooperation protocol"
git branch -M main
git remote add origin https://github.com/xxz5166/codex2claude-codex.git
git push -u origin main
```

## If the remote already exists

```bash
git status
git add .
git commit -m "chore: prepare GitHub release"
git push
```

## Before pushing

- Run `npm test`
- Run `node src/cli.js --help`
- Run `npm pack --dry-run`
- Make sure `.ai-coop/` is not committed
