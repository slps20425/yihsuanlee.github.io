---
description: Pick up a task from the list
---

1. Read the backlog.
   $ cat .gemini/tasks_.md

2. Mark the top task as In Progress (User should edit `.gemini/tasks_.md` manually or via tool to mark it).
   
3. Update global workflow status.
   $ sed -i '' 's/STATUS: [A-Z_]*/STATUS: IN_PROGRESS/' AGENTS_WORKFLOW.md
