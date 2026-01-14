---
description: Run QAE verification checks
---

1. Check the current workflow status.
   $ cat AGENTS_WORKFLOW.md

2. Read the active tasks.
   $ cat .gemini/tasks_.md

3. Read the Source of Truth context.
   $ cat CONTEXT.md || echo "CONTEXT.md not found"

4. Start the browser to verify the changes at the DEPLOY_URL found in AGENTS_WORKFLOW.md.
   [You should use the `browser_subagent` or `open_browser` tool here to verify the UI.]

5. If verification passes:
   $ sed -i '' 's/STATUS: READY_FOR_QA/STATUS: DONE/' AGENTS_WORKFLOW.md

6. If verification fails:
   $ sed -i '' 's/STATUS: READY_FOR_QA/STATUS: FIX_REQUIRED/' AGENTS_WORKFLOW.md
   [Write a bug report in `.gemini/tasks_.md` or a new file.]
