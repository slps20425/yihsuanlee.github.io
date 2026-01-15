---
description: Sync tasks from Firebase and start working on the highest priority item.
---

1. **Fetch Tasks**: Run the synchronization script to see pending tasks.
   ```bash
   node scripts/sync-tasks.mjs
   ```

2. **Update Task List**:
   - Read the output from the script.
   - Update `tasks_.md`:
     - Add new tasks found in the output.
     - Move high-priority tasks (Priority >= 5) to the top of the list.
     - Ensure the top task is not marked as completed (`[x]`).

3. **Pick & Start Task**:
   - Identify the top-most pending task in `tasks_.md`.
   - **Critical**: Note the **Task ID** (e.g., `7cm4Qw...`) displayed in the output from Step 1. You will need this ID to complete the task later.
   - Mark the task as in-progress (`[/]`) if not already.
   - Update the global status to `IN_PROGRESS` in `AGENTS_WORKFLOW.md` (if applicable).
   - **Begin Execution**: Start working on the task immediately (e.g., via `task_boundary`).

4. **Complete Task**:
   - Once the task is finished and verified:
     - Mark the task as `[x]` in `tasks_.md`.
     - **Update Firebase**: Run the completion script using the **Task ID** you saved from Step 3:
       ```bash
       node scripts/complete-task.mjs <TASK_ID>
       ```
     - Update `AGENTS_WORKFLOW.md` status to `READY_FOR_QA` (if applicable).