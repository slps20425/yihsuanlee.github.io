---
description: Complete the current task, update Firebase, and deploy (ship) the changes.
---

1. **Mark Task as Complete**:
   - Manually check the box `[x]` in `tasks_.md` for the current task.
   - Run the completion script with the **Task ID** (from `sync_task` or `tasks_.md`).
   ```bash
   node scripts/complete-task.mjs <TASK_ID>
   ```

2. **Deploy (Ship)**:
   - Build, commit, and deploy the application.
   - **Turbo**: This command is safe to auto-run if the user triggered this workflow.
   // turbo
   npm run ship

3. **Update Status**:
   - Update `AGENTS_WORKFLOW.md` status to `READY_FOR_QA`.
   - Ensure the `Deploy URL` is updated to `https://wisecat-8df8d.web.app` (or specific route).

4. **Notify**:
   - Inform the user that the task is complete, recorded in Firebase, and deployed.
