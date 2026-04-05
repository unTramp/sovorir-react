import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const INCLUDED_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.css',
  '.html',
]);

const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'coverage']);

export function parseArgs(argv) {
  const args = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }

    const normalized = token.slice(2);
    const [key, inlineValue] = normalized.split('=');

    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

function listFiles(targetPath, files) {
  const stat = fs.statSync(targetPath);

  if (stat.isFile()) {
    if (INCLUDED_EXTENSIONS.has(path.extname(targetPath))) {
      files.push(targetPath);
    }
    return;
  }

  if (!stat.isDirectory()) return;

  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue;
    listFiles(path.join(targetPath, entry.name), files);
  }
}

export function collectFiles(targets) {
  const cwd = process.cwd();
  const files = [];

  for (const target of targets) {
    const resolved = path.resolve(cwd, target);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Target not found: ${target}`);
    }

    listFiles(resolved, files);
  }

  return [...new Set(files)].sort();
}

export function buildFileContext(targets, options = {}) {
  const { maxFiles = 12, maxChars = 60_000 } = options;
  const cwd = process.cwd();
  const files = collectFiles(targets).slice(0, maxFiles);
  let consumedChars = 0;

  const sections = files.map((filePath) => {
    const relativePath = path.relative(cwd, filePath);
    const remaining = Math.max(maxChars - consumedChars, 0);
    const raw = fs.readFileSync(filePath, 'utf8');
    const content = raw.slice(0, remaining);
    consumedChars += content.length;

    return `FILE: ${relativePath}\n${content}`;
  });

  return {
    files,
    context: sections.join('\n\n'),
  };
}

export function readTextFile(relativePath) {
  const filePath = path.resolve(process.cwd(), relativePath);
  return fs.readFileSync(filePath, 'utf8');
}

export function getGitDiff({ staged = false, ref } = {}) {
  const command = ref
    ? `git diff ${ref}...HEAD`
    : staged
      ? 'git diff --cached'
      : 'git diff';

  return execSync(command, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

export function getChangedFiles(diffText) {
  return diffText
    .split('\n')
    .filter((line) => line.startsWith('diff --git '))
    .map((line) => line.replace(/^diff --git a\/(.+?) b\/.+$/, '$1'));
}

export function extractJson(text) {
  const trimmed = text.trim();

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

  return JSON.parse(candidate);
}

export function writeOutput(filePath, content) {
  const resolved = path.resolve(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, content, 'utf8');
  return resolved;
}
