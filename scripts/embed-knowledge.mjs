import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';

// Get API keys from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

if (!GEMINI_API_KEY || !PINECONE_API_KEY) {
    console.error('❌ Missing API keys. Set GEMINI_API_KEY and PINECONE_API_KEY');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index('wisecat-knowledge');

async function embedKnowledge() {
    console.log('🧠 WiseCat Knowledge Embedding (Gemini Flash)');
    console.log('==================================================\n');

    // Read RAG data
    const ragData = JSON.parse(
        fs.readFileSync('knowledge/rag-data.json', 'utf-8')
    );

    console.log(`📚 Found ${ragData.documents.length} documents to embed\n`);

    let totalChunks = 0;

    for (const doc of ragData.documents) {
        console.log(`📄 Processing: ${doc.type}`);

        // Chunk document (Gemini can handle larger chunks)
        const chunks = chunkDocument(doc.content, 50000); // 50K chars
        console.log(`   Split into ${chunks.length} chunks`);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            try {
                // Generate embedding using Gemini (FREE!)
                const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
                const result = await model.embedContent(chunk);
                const embedding = result.embedding.values;

                // Upload to Pinecone
                await index.upsert([{
                    id: `${doc.id}-chunk-${i}`,
                    values: embedding,
                    metadata: {
                        documentId: doc.id,
                        documentType: doc.type,
                        path: doc.path,
                        chunkIndex: i,
                        totalChunks: chunks.length,
                        content: chunk.substring(0, 1000), // Store first 1000 chars
                        wordCount: doc.wordCount
                    }
                }]);

                totalChunks++;
                console.log(`   ✅ Embedded chunk ${i + 1}/${chunks.length} (FREE!)`);

                // Rate limiting (Gemini: 1500 requests/day free tier)
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error(`   ❌ Error embedding chunk ${i + 1}:`, error.message);
            }
        }

        console.log('');
    }

    console.log('==================================================');
    console.log(`✅ Embedding complete!`);
    console.log(`   📊 Total chunks embedded: ${totalChunks}`);
    console.log(`   💾 Vector database: wisecat-knowledge`);
    console.log(`   💰 Cost: $0.00 (Gemini embeddings are FREE!)`);
    console.log('==================================================\n');
}

function chunkDocument(content, maxChars) {
    const paragraphs = content.split('\n\n');
    const chunks = [];
    let currentChunk = '';

    for (const para of paragraphs) {
        if ((currentChunk + para).length > maxChars) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = para;
        } else {
            currentChunk += '\n\n' + para;
        }
    }

    if (currentChunk) chunks.push(currentChunk.trim());

    return chunks.filter(c => c.length > 0);
}

// Run
embedKnowledge().catch(console.error);
