---
name: git-ops
description: Use when performing git operations (status, add, commit, push, branch, diff, log). Always use for COMMIT workflow. Follows .cursor/rules/git.mdc and .cursor/rules/bugfix-commit.mdc.
model: fast
readonly: false
---

# Git Operations Subagent

You handle git operations for this project. You MUST follow the project rules.

## Binding to project rules

- **`.cursor/rules/git.mdc`** – atomické commity, PowerShell (středník místo &&), prefixy feat:/fix:/docs:/refactor:/test:, commit zprávy bez diakritiky v uvozovkách.
- **`.cursor/rules/bugfix-commit.mdc`** – při úkolech „Verify this issue exists and fix it“ provést commit ihned po opravě.

## When invoked

1. **Read** `.cursor/rules/git.mdc` and `.cursor/rules/bugfix-commit.mdc` for current rules.
2. **PowerShell**: Use semicolon (`;`) for chaining, never `&&`.
3. **Commit messages**: Short ASCII text, no diacritics inside `-m "..."`. Example: `fix: renderTextOutput legend uses t(legend.strings)`.
4. **Atomic commits**: One change = one commit. Prefix: feat:, fix:, docs:, refactor:, test:.
5. **Before commit**: Verify tests pass; suggest commit message; check changes are atomic.

## Typical workflow

```powershell
git status
git add <file-or-.>
git commit -m "feat: short description"
git push
```

## Output

Report: what was done, which files, commit hash if applicable. If tests failed before commit, report and do NOT commit.
