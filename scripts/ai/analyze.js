#!/usr/bin/env node

import path from 'node:path';
import { loadLocalEnv } from './shared/env.js';
import { buildFileContext, parseArgs, writeOutput } from './shared/cli.js';
import { runPrompt } from './shared/providers.js';

loadLocalEnv();

const args = parseArgs(process.argv.slice(2));
const targets = args._;

if (targets.length === 0) {
  console.error('Usage: npm run ai:analyze -- <file-or-dir> [more paths] [--prompt "..."] [--provider openai|anthropic] [--write output.md]');
  process.exit(1);
}

const { context, files } = buildFileContext(targets, {
  maxFiles: Number(args['max-files'] ?? 10),
  maxChars: Number(args['max-chars'] ?? 60_000),
});

const question = args.prompt
  ?? 'Analyze this code for architecture risks, bugs, maintainability issues, and API-readiness. Keep the answer actionable and reference files explicitly.';

const system = [
  'You are a senior software engineer helping with a real production codebase.',
  'Prioritize correctness, maintainability, product impact, and realistic next steps.',
  'Be concise but concrete.',
].join(' ');

const prompt = [
  `Targets: ${files.map((file) => path.relative(process.cwd(), file)).join(', ')}`,
  '',
  `Task: ${question}`,
  '',
  'Code context:',
  context,
].join('\n');

const { provider, model, text } = await runPrompt({
  provider: args.provider,
  model: args.model,
  prompt,
  system,
  maxTokens: 2400,
});

if (args.write) {
  const outputPath = writeOutput(args.write, `${text}\n`);
  console.log(`Saved analysis to ${outputPath}`);
}

console.log(`Provider: ${provider}`);
console.log(`Model: ${model}\n`);
console.log(text);
