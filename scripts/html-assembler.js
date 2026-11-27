const fs = require('fs');
const path = require('path');

const INCLUDE_REGEX = /^[ \t]*<!--\s*@include\s+([^\s>]+)\s*-->[ \t]*$/gm;

/**
 * Recursively resolves `<!-- @include relative/path.html -->` directives.
 * Protects against path traversal and circular includes.
 */
function resolveHtmlIncludes(htmlContent, rootDir, visited = new Set()) {
  const normalizedRoot = path.resolve(rootDir);

  return htmlContent.replace(INCLUDE_REGEX, (match, relPath) => {
    const cleanRel = relPath.trim();
    const targetPath = path.resolve(normalizedRoot, cleanRel);

    if (!targetPath.startsWith(normalizedRoot + path.sep) && targetPath !== normalizedRoot) {
      throw new Error(`Invalid include path outside workspace root: ${cleanRel}`);
    }

    if (visited.has(targetPath)) {
      throw new Error(`Circular HTML include detected: ${cleanRel}`);
    }

    if (!fs.existsSync(targetPath)) {
      throw new Error(`Included HTML partial not found: ${cleanRel}`);
    }

    const nextVisited = new Set(visited);
    nextVisited.add(targetPath);

    const partialContent = fs.readFileSync(targetPath, 'utf8');
    return resolveHtmlIncludes(partialContent, normalizedRoot, nextVisited);
  });
}

function loadHtmlFile(filePath, rootDir = path.resolve(__dirname, '..')) {
  const absPath = path.resolve(filePath);
  const rawHtml = fs.readFileSync(absPath, 'utf8');
  return resolveHtmlIncludes(rawHtml, rootDir, new Set([absPath]));
}

function loadPreviewHtml(rootDir = path.resolve(__dirname, '..')) {
  return loadHtmlFile(path.join(rootDir, 'preview.html'), rootDir);
}

if (require.main === module) {
  const rootDir = path.resolve(__dirname, '..');
  const assembled = loadPreviewHtml(rootDir);
  const lineCount = assembled.split(/\r?\n/).length;
  console.log(`[OK] Assembled preview.html successfully (${lineCount} lines total from modular partials).`);
}

module.exports = {
  resolveHtmlIncludes,
  loadHtmlFile,
  loadPreviewHtml,
};
