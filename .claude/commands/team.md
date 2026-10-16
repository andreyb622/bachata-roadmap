---
description: Token-efficient subagent pipeline — collect → plan → optimize → execute → test → review
argument-hint: <task description>
---

Task: $ARGUMENTS

You are the orchestrator. Agents exchange data ONLY through files in `.claude/work/`.

0. Triage, from the task text only. If the task is trivial (an edit in one file), warn the user that the full pipeline is overkill, propose the short pipeline `planner (short mode) → executor → tester → reviewer`, and wait for their answer. If the task is ambiguous, ask the user before starting.
1. Clear old artifacts: `rm -f .claude/work/*.md .claude/work/baseline.txt`.
2. Run the subagents strictly sequentially, one at a time:
   collector → planner → optimizer → executor → tester → reviewer.
   Right before the first executor run, snapshot the working tree so the reviewer sees only the executor's changes:
   `idx=$(mktemp); GIT_INDEX_FILE=$idx git read-tree HEAD && GIT_INDEX_FILE=$idx git add -A && echo "$(git commit-tree $(GIT_INDEX_FILE=$idx git write-tree) -p HEAD -m baseline)" > .claude/work/baseline.txt; rm -f $idx`
   (a dangling commit with tracked AND untracked files; does not modify the tree, the index or the stash list).
   Pass each one only the task text and the relevant file paths in `.claude/work/`. No retelling of previous outputs.
   Task texts and all artifacts in `.claude/work/` are in English (Russian only for verbatim UI copy).
3. Do not read source code or the artifacts yourself; rely on the agents' short replies. Exception: `.claude/work/review.md` in step 6.
4. If planner or optimizer reports blockers, or executor returns `BLOCKED (other)`: stop and show the user the blocker (read the blocker section of the artifact only).
   If executor returns `BLOCKED (plan-incomplete)`: once per run, re-run optimizer with the model overridden to `opus` and the prompt "retry: read .claude/work/report.md", then executor with "resume: read .claude/work/report.md". If it is blocked again, stop and show the user the blocker.
5. If tester returns FAIL: run executor in fix mode ("fix: read .claude/work/test-report.md"), then tester again. At most 2 fix iterations; then stop and report to the user with the path `.claude/work/test-report.md`.
6. After tester returns PASS, run reviewer. If it returns PASS, go to step 8. Otherwise:
   - Read `.claude/work/review.md` and show the user the findings verbatim (numbered, with severity).
   - Ask what to fix: finding numbers, `all`, `major` (BLOCKER + MAJOR) or `none`. Do not fix anything without the answer.
   - `none` → step 8. Otherwise run executor with "fix review: N, M — read .claude/work/review.md", then tester (step 5 rules apply).
   - Then run reviewer once more and repeat this step. At most 2 review rounds; after that list the remaining findings in the final report.
7. Between stages print exactly one status line, e.g. `✓ collector — context.md 42 lines, 0 open questions`.
8. Finish with at most 10 lines: changed files (from `.claude/work/report.md`), the test result and unfixed review findings (numbers + severity). Do not commit.
