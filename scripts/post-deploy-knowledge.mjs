#!/usr/bin/env node

/**
 * Post-Deployment Knowledge Update Script
 * 
 * This script runs after `npm run ship` to:
 * 1. Extract code metadata from TypeScript/JavaScript files
 * 2. Update knowledge base documentation
 * 3. Generate/update Mermaid diagrams
 * 4. Create searchable knowledge index for future RAG integration
 * 
 * Usage: node scripts/post-deploy-knowledge.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const KNOWLEDGE_DIR = path.join(PROJECT_ROOT, 'knowledge');

console.log('🧠 WiseCat Knowledge Base Update');
console.log('='.repeat(50));

// Step 1: Extract Code Metadata
console.log('\n📊 Step 1: Extracting code metadata...');

const codeMetadata = {
    lastUpdated: new Date().toISOString(),
    deployment: {
        timestamp: new Date().toISOString(),
        gitCommit: getGitCommit(),
        gitBranch: getGitBranch()
    },
    modules: {},
    files: [],
    dependencies: extractDependencies()
};

// Scan TypeScript/JavaScript files
const sourceFiles = [
    ...findFiles(path.join(PROJECT_ROOT, 'src'), ['.ts', '.tsx']),
    ...findFiles(path.join(PROJECT_ROOT, 'functions'), ['.js']),
    ...findFiles(PROJECT_ROOT, ['.html'])
];

console.log(`   Found ${sourceFiles.length} source files`);

sourceFiles.forEach(file => {
    const relativePath = path.relative(PROJECT_ROOT, file);
    const content = fs.readFileSync(file, 'utf-8');

    codeMetadata.files.push({
        path: relativePath,
        size: content.length,
        lines: content.split('\n').length,
        type: path.extname(file),
        lastModified: fs.statSync(file).mtime.toISOString()
    });
});

// Step 2: Update Knowledge Index
console.log('\n📝 Step 2: Updating knowledge index...');

const knowledgeIndex = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    metadata: codeMetadata,
    modules: scanModuleDocumentation(),
    diagrams: scanDiagrams(),
    schemas: scanSchemas()
};

fs.writeFileSync(
    path.join(KNOWLEDGE_DIR, 'index.json'),
    JSON.stringify(knowledgeIndex, null, 2)
);

console.log(`   ✅ Knowledge index updated: ${KNOWLEDGE_DIR}/index.json`);

// Step 3: Generate Deployment Summary
console.log('\n📋 Step 3: Generating deployment summary...');

const summary = generateDeploymentSummary(knowledgeIndex);
fs.writeFileSync(
    path.join(KNOWLEDGE_DIR, 'LAST_DEPLOYMENT.md'),
    summary
);

console.log(`   ✅ Deployment summary: ${KNOWLEDGE_DIR}/LAST_DEPLOYMENT.md`);

// Step 4: Prepare for RAG (Future)
console.log('\n🤖 Step 4: Preparing RAG-ready data...');

const ragData = {
    documents: [],
    metadata: knowledgeIndex
};

// Read all module documentation
const moduleDocs = fs.readdirSync(path.join(KNOWLEDGE_DIR, 'modules'))
    .filter(f => f.endsWith('.md') && f !== 'README.md');

moduleDocs.forEach(doc => {
    const content = fs.readFileSync(
        path.join(KNOWLEDGE_DIR, 'modules', doc),
        'utf-8'
    );

    ragData.documents.push({
        id: doc.replace('.md', ''),
        type: 'module_documentation',
        content: content,
        path: `knowledge/modules/${doc}`,
        wordCount: content.split(/\s+/).length
    });
});

fs.writeFileSync(
    path.join(KNOWLEDGE_DIR, 'rag-data.json'),
    JSON.stringify(ragData, null, 2)
);

console.log(`   ✅ RAG data prepared: ${KNOWLEDGE_DIR}/rag-data.json`);
console.log(`   📄 ${ragData.documents.length} documents ready for embedding`);

// Final Summary
console.log('\n' + '='.repeat(50));
console.log('✅ Knowledge base update complete!');
console.log(`   📁 Files scanned: ${codeMetadata.files.length}`);
console.log(`   📚 Modules documented: ${Object.keys(knowledgeIndex.modules).length}`);
console.log(`   📊 Diagrams: ${Object.keys(knowledgeIndex.diagrams).length}`);
console.log(`   🤖 RAG documents: ${ragData.documents.length}`);
console.log('='.repeat(50));

// Helper Functions

function findFiles(dir, extensions, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules and hidden directories
            if (!file.startsWith('.') && file !== 'node_modules') {
                findFiles(filePath, extensions, fileList);
            }
        } else {
            const ext = path.extname(file);
            if (extensions.includes(ext)) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

function getGitCommit() {
    try {
        return execSync('git rev-parse HEAD').toString().trim();
    } catch {
        return 'unknown';
    }
}

function getGitBranch() {
    try {
        return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    } catch {
        return 'unknown';
    }
}

function extractDependencies() {
    const packageJson = JSON.parse(
        fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8')
    );

    return {
        production: packageJson.dependencies || {},
        development: packageJson.devDependencies || {}
    };
}

function scanModuleDocumentation() {
    const modulesDir = path.join(KNOWLEDGE_DIR, 'modules');
    if (!fs.existsSync(modulesDir)) return {};

    const modules = {};
    const files = fs.readdirSync(modulesDir)
        .filter(f => f.endsWith('.md') && f !== 'README.md');

    files.forEach(file => {
        const content = fs.readFileSync(path.join(modulesDir, file), 'utf-8');
        const moduleName = file.replace('.md', '');

        // Extract title from first heading
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : moduleName;

        modules[moduleName] = {
            title,
            file: `modules/${file}`,
            size: content.length,
            lastModified: fs.statSync(path.join(modulesDir, file)).mtime.toISOString()
        };
    });

    return modules;
}

function scanDiagrams() {
    const diagramsDir = path.join(KNOWLEDGE_DIR, 'diagrams');
    if (!fs.existsSync(diagramsDir)) return {};

    const diagrams = {};
    const files = fs.readdirSync(diagramsDir)
        .filter(f => f.endsWith('.mmd') || f.endsWith('.md'));

    files.forEach(file => {
        diagrams[file] = {
            path: `diagrams/${file}`,
            type: path.extname(file),
            lastModified: fs.statSync(path.join(diagramsDir, file)).mtime.toISOString()
        };
    });

    return diagrams;
}

function scanSchemas() {
    const schemasDir = path.join(KNOWLEDGE_DIR, 'schemas');
    if (!fs.existsSync(schemasDir)) return {};

    const schemas = {};
    const files = fs.readdirSync(schemasDir)
        .filter(f => f.endsWith('.json') || f.endsWith('.md'));

    files.forEach(file => {
        schemas[file] = {
            path: `schemas/${file}`,
            lastModified: fs.statSync(path.join(schemasDir, file)).mtime.toISOString()
        };
    });

    return schemas;
}

function generateDeploymentSummary(index) {
    return `# Deployment Summary

**Generated**: ${new Date().toISOString()}  
**Git Commit**: ${index.metadata.deployment.gitCommit}  
**Git Branch**: ${index.metadata.deployment.gitBranch}

## 📊 Code Statistics

- **Total Files**: ${index.metadata.files.length}
- **Total Lines**: ${index.metadata.files.reduce((sum, f) => sum + f.lines, 0).toLocaleString()}
- **Total Size**: ${(index.metadata.files.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB

## 📚 Documentation Status

- **Modules Documented**: ${Object.keys(index.modules).length}
- **Diagrams**: ${Object.keys(index.diagrams).length}
- **Schemas**: ${Object.keys(index.schemas).length}

## 📁 File Breakdown

| Type | Count | Total Lines |
|------|-------|-------------|
${generateFileBreakdown(index.metadata.files)}

## 🔗 Quick Links

${Object.entries(index.modules).map(([key, mod]) => `- [${mod.title}](${mod.file})`).join('\n')}

---

*This summary is automatically generated after each deployment.*
`;
}

function generateFileBreakdown(files) {
    const breakdown = {};

    files.forEach(file => {
        const ext = file.type || 'other';
        if (!breakdown[ext]) {
            breakdown[ext] = { count: 0, lines: 0 };
        }
        breakdown[ext].count++;
        breakdown[ext].lines += file.lines;
    });

    return Object.entries(breakdown)
        .sort((a, b) => b[1].lines - a[1].lines)
        .map(([ext, data]) => `| ${ext} | ${data.count} | ${data.lines.toLocaleString()} |`)
        .join('\n');
}
