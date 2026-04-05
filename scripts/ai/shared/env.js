import fs from 'node:fs';
import path from 'node:path';

const ENV_FILES = ['.env', '.env.local', '.env.ai', '.env.ai.local'];

function normalizeValue(rawValue) {
  const trimmed = rawValue.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  const withoutExport = trimmed.startsWith('export ')
    ? trimmed.slice('export '.length)
    : trimmed;

  const separatorIndex = withoutExport.indexOf('=');
  if (separatorIndex === -1) return null;

  const key = withoutExport.slice(0, separatorIndex).trim();
  const value = withoutExport.slice(separatorIndex + 1);

  if (!key) return null;

  return [key, normalizeValue(value)];
}

export function loadLocalEnv(cwd = process.cwd()) {
  for (const fileName of ENV_FILES) {
    const filePath = path.join(cwd, fileName);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const parsed = parseLine(line);
      if (!parsed) continue;

      const [key, value] = parsed;
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

export function getEnv(name) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function requireEnv(name) {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}
