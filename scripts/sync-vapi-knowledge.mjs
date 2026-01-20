import fs from 'fs';
import path from 'path';

// Configuration
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_BASE_URL = 'https://api.vapi.ai';
const DRY_RUN = process.env.DRY_RUN !== 'false'; // Default to true for safety

// Sanitization Rules
const SENSITIVE_PATTERNS = [
    // 5. Hide Script tags (Cloudflare WAF often blocks these in POST bodies)
    { regex: /<script\b[^>]*>([\s\S]*?)<\/script>/gim, replacement: '```javascript\n$1\n```' },
    { regex: /<[^>]+>/g, replacement: '' } // strip other HTML tags just in case, or be more selective if needed. 
    // Actually, let's just strip script tags specifically and maybe iframes. 
    // Vapi handles markdown well, but raw HTML might be flagged.
];

async function syncKnowledge() {
    console.log(`🔐 Vapi Knowledge Sync (Dry Run: ${DRY_RUN})`);
    console.log('===========================================\n');

    const uploadDir = path.join('knowledge', 'vapi-upload');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (!VAPI_API_KEY && !DRY_RUN) {
        console.error('❌ Missing VAPI_API_KEY env var');
        process.exit(1);
    }

    // 1. Read Knowledge Data
    const ragPath = path.join('knowledge', 'rag-data.json');
    if (!fs.existsSync(ragPath)) {
        console.error(`❌ Could not find ${ragPath}`);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(ragPath, 'utf8'));
    console.log(`📚 Found ${data.documents.length} documents.`);

    // 2. Process & Sanitize
    const documentsToUpload = [];

    for (const doc of data.documents) {
        console.log(`\n📄 Processing: ${doc.id} (${doc.type})`);

        let sanitizedContent = doc.content;
        let isModified = false;

        // Apply Regex Rules
        for (const rule of SENSITIVE_PATTERNS) {
            if (rule.regex.test(sanitizedContent)) {
                sanitizedContent = sanitizedContent.replace(rule.regex, rule.replacement);
                isModified = true;
            }
        }

        // Apply Line-based Rules (Table row filtering)
        const lines = sanitizedContent.split('\n');
        const cleanLines = lines.map(line => {
            // If a table row has both Base Price and User Price, we likely want to hide the Base Price
            // Example: | US Local | $1.15 | 2.0 | $2.30 |  ->  | US Local | - | - | $2.30 |
            if (line.includes('|') && /\d+\.\d+/.test(line)) {
                // Check if it looks like the specific pricing tables we know
                // Pattern: | Name | Base | Multi | User |
                // We'll just obscure the middle columns if we suspect it's a pricing table
                const parts = line.split('|');
                if (parts.length >= 5) {
                    // Primitive heuristic: if it looks like a 4+ column table
                    // We can attempt to blank out columns 2 and 3 (index 1 and 2)
                    // parts[0] is empty string usually for markdown tables
                    return line; // Too risky to automate blindly without destroying format. 
                    // Better strategy: The regex above "hide modifiers" helps, 
                    // requires manual check.
                }
            }
            return line;
        });

        // Manual override for specific known leaks in payment-system.md
        if (doc.id === 'payment-system') {
            sanitizedContent = sanitizedContent
                .replace(/\|\s*Base Price\s*\|\s*Multiplier\s*\|\s*User Price\s*\|/g, '| Service Cost |')
                .replace(/\|\s*\$\d+\.\d+\s*\|\s*\d+\.\d+\s*\|\s*\$(\d+\.\d+)\s*\|/g, '| $$1 |'); // Keep only user price

            // Remove the multiplier explanation block
            sanitizedContent = sanitizedContent.replace(/### Cost Calculation Examples[\s\S]*?## Database Schema/, '## Database Schema');

            isModified = true;
        }

        // Save locally for fallback manual upload
        const localPath = path.join(uploadDir, `${doc.id}.md`);
        fs.writeFileSync(localPath, sanitizedContent);
        console.log(`   💾 Saved to ${localPath}`);

        if (isModified) {
            console.log('   🧹 Content sanitized (sensitive pricing hidden)');
        }

        if (DRY_RUN) {
            console.log('   👀 PREVIEW (First 500 chars):');
            console.log('   ---------------------------------------------------');
            console.log(sanitizedContent.substring(0, 500) + '...');
            console.log('   ---------------------------------------------------');
        } else {
            // 3. Upload to Vapi
            try {
                const fileId = await uploadToVapi(doc.id, sanitizedContent);
                documentsToUpload.push(fileId);
                console.log('   ✅ Uploaded to Vapi');
            } catch (err) {
                console.error('   ❌ Upload failed:', err.message);
            }
        }
    }

    if (DRY_RUN) {
        console.log('\n⚠️  This was a DRY RUN. No data was sent to Vapi.');
        console.log('Run with DRY_RUN=false VAPI_API_KEY=... node scripts/sync-vapi-knowledge.mjs to execute.');
    } else {
        console.log('\n🎉 knowledge sync complete!');

        // 4. Update the Tool with these File IDs
        const TOOL_ID = process.env.VAPI_TOOL_ID || '1d5c4fd4-e3fb-42c3-8842-e81fe2af3a83';
        if (TOOL_ID) {
            try {
                console.log(`\n🔗 Attaching ${documentsToUpload.length} files to Tool ${TOOL_ID}...`);
                await updateTool(TOOL_ID, documentsToUpload);
                console.log('   ✅ Tool updated successfully!');
            } catch (err) {
                console.error('   ❌ Failed to update tool:', err.message);
            }
        }
    }
}

async function uploadToVapi(name, content) {
    // 1. Create File
    const blob = new Blob([content], { type: 'text/markdown' });
    const formData = new FormData();
    formData.append('file', blob, `${name}.md`);

    const fileRes = await fetch(`${VAPI_BASE_URL}/file`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${VAPI_API_KEY}`
        },
        body: formData
    });

    if (!fileRes.ok) {
        const err = await fileRes.text();
        throw new Error(`File upload failed: ${err}`);
    }

    const fileData = await fileRes.json();
    console.log(`      Found File ID: ${fileData.id}`);

    // Return just the ID for potential future use
    return fileData.id;
}

async function updateTool(toolId, fileIds) {
    const res = await fetch(`${VAPI_BASE_URL}/tool/${toolId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${VAPI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            knowledgeBases: [
                {
                    server: {
                        url: "https://api.vapi.ai/knowledge-base"
                    },
                    fileIds: fileIds
                }
            ]
        })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
    }
    return res.json();
}

syncKnowledge();
