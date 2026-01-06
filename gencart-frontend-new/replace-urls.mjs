import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const srcDir = './src';

// Files that already use the env variable correctly (skip these)
const skipFiles = [
  'src/utils/api.js',
  'src/config/api.js', 
  'src/utils/cloudinaryConfig.js',
  'src/utils/imageUtils.js'
];

function walkDir(dir, callback) {
  readdirSync(dir).forEach(file => {
    const filepath = join(dir, file);
    const stat = statSync(filepath);
    if (stat.isDirectory()) {
      walkDir(filepath, callback);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      callback(filepath);
    }
  });
}

function processFile(filepath) {
  // Skip files that already handle env variables
  if (skipFiles.some(skip => filepath.includes(skip.replace(/\//g, '\\')) || filepath.includes(skip))) {
    console.log(`Skipping: ${filepath}`);
    return;
  }

  let content = readFileSync(filepath, 'utf8');
  let modified = false;

  // Check if file contains hardcoded localhost URLs
  if (content.includes('http://localhost:8000')) {
    console.log(`Processing: ${filepath}`);
    
    // Add import at the top if not already present
    if (!content.includes("import { API_BASE_URL") && !content.includes("import API_BASE_URL") && !content.includes('from "../utils/api"') && !content.includes('from "../../utils/api"') && !content.includes("from '../utils/api'") && !content.includes("from '../../utils/api'")) {
      // Determine relative path
      const depth = filepath.split(/[\\\/]/).length - 2; // -2 for ./src
      let importPath;
      if (depth === 1) {
        importPath = '../utils/api';
      } else if (depth === 2) {
        importPath = '../../utils/api';
      } else if (depth >= 3) {
        importPath = '../'.repeat(depth - 1) + 'utils/api';
      } else {
        importPath = './utils/api';
      }
      
      // Find first import statement
      const importMatch = content.match(/^import .+ from .+;?\s*$/m);
      if (importMatch) {
        const insertPos = importMatch.index + importMatch[0].length;
        content = content.slice(0, insertPos) + `\nimport { API_BASE_URL } from '${importPath}';` + content.slice(insertPos);
      } else {
        content = `import { API_BASE_URL } from '${importPath}';\n` + content;
      }
      modified = true;
    }

    // Replace URLs - careful with different patterns
    // Pattern 1: "http://localhost:8000/api/..." -> `${API_BASE_URL}/...`
    content = content.replace(/"http:\/\/localhost:8000\/api\/([^"]+)"/g, '`${API_BASE_URL}/$1`');
    content = content.replace(/'http:\/\/localhost:8000\/api\/([^']+)'/g, '`${API_BASE_URL}/$1`');
    
    // Pattern 2: "http://localhost:8000/api" (no trailing path) -> API_BASE_URL
    content = content.replace(/"http:\/\/localhost:8000\/api"/g, 'API_BASE_URL');
    content = content.replace(/'http:\/\/localhost:8000\/api'/g, 'API_BASE_URL');
    
    // Pattern 3: Template literals with localhost
    content = content.replace(/`http:\/\/localhost:8000\/api\//g, '`${API_BASE_URL}/');
    
    // Pattern 4: "http://localhost:8000" (base, no /api)
    content = content.replace(/"http:\/\/localhost:8000([^\/])"/g, '`${API_BASE_URL.replace("/api", "")}$1`');
    content = content.replace(/'http:\/\/localhost:8000([^\/])'/g, "`${API_BASE_URL.replace('/api', '')}$1`");
    
    // Pattern 5: `http://localhost:8000${...}` 
    content = content.replace(/`http:\/\/localhost:8000\$\{/g, '`${API_BASE_URL.replace("/api", "")}${');
    
    modified = true;
  }

  if (modified) {
    writeFileSync(filepath, content, 'utf8');
    console.log(`  Updated: ${filepath}`);
  }
}

console.log('Starting URL replacement...\n');
walkDir(srcDir, processFile);
console.log('\nDone!');
