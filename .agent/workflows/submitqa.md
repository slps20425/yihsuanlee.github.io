---
description: Submit the current task for QA
---

1. Run the ship command to deploy the changes.
   // turbo
   $ npx run ship

2. Update AGENTS_WORKFLOW.md to indicate QA is ready.
   $ sed -i '' 's/STATUS: [A-Z_]*/STATUS: READY_FOR_QA/' AGENTS_WORKFLOW.md

3. Read the current deployment URL from the output or file (optional verification).
   $ grep "DEPLOY_URL" AGENTS_WORKFLOW.md
