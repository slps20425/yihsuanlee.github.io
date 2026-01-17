---
trigger: always_on
---

Global Browser Policy

Execution Mode: By default, perform logic verification using unit tests or code analysis. Do not launch or interact with a browser unless the user's prompt explicitly contains keywords like verify in browser, UI test, or screenshot.

Timeout & Resource Cap: Any browser action must have a hard timeout of 30 seconds. If the page does not reach networkidle within 10 seconds, the agent must stop, report the timeout, and ask to proceed instead of hanging.

Headless Preference: Unless "visual inspection" is requested, always run in headless mode to save resources and prevent UI-related event loop freezes.