# N8N Workflow Integration Script

This script can be run to automatically update n8n workflow documentation using the n8n MCP server.

## Usage

```bash
# Run manually
node scripts/update-n8n-knowledge.mjs

# Or as part of knowledge update
npm run update-knowledge
```

## What It Does

1. Connects to n8n MCP server
2. Fetches all active workflows
3. Gets workflow structure and node information
4. Updates`knowledge/modules/n8n-workflows.md`
5. Generates workflow diagrams

## Future Enhancement

This can be integrated into the post - deployment script to automatically keep n8n documentation current.

---

** Note **: Currently, n8n documentation is manually created using MCP data.Future versions will automate this process.
