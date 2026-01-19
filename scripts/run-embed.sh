#!/bin/bash
# Wrapper script to run embedding with API keys from gcloud secrets

echo "🔑 Fetching API keys from Google Cloud Secret Manager..."

# Get API keys from gcloud secrets
export GEMINI_API_KEY=$(gcloud secrets versions access latest --secret="GEMINI_API_KEY" 2>/dev/null)
export PINECONE_API_KEY=$(gcloud secrets versions access latest --secret="PINECONE_API_KEY" 2>/dev/null)

# Check if keys were retrieved
if [ -z "$GEMINI_API_KEY" ] || [ -z "$PINECONE_API_KEY" ]; then
    echo "❌ Failed to retrieve API keys from gcloud secrets"
    echo "Make sure you're authenticated: gcloud auth login"
    exit 1
fi

echo "✅ API keys retrieved successfully"
echo ""

# Run the embedding script
node scripts/embed-knowledge.mjs
