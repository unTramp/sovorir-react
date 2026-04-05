#!/usr/bin/env node

import { loadLocalEnv } from './shared/env.js';
import { getChangedFiles, getGitDiff, parseArgs, writeOutput } from './shared/cli.js';
import { runPrompt } from './shared/providers.js';

loadLocalEnv();

const args = parseArgs(process.argv.slice(2));

const diff = getGitDiff({
  staged: Boolean(args.staged),
  ref: typeof args.ref === 'string' ? args.ref : undefined,
});

if (!diff.trim()) {
  console.error('No diff found. Stage changes or create a working tree diff first.');
  process.exit(1);
}

const changedFiles = getChangedFiles(diff);

const system = [
  'You are reviewing a git diff for a production codebase.',
  'Find likely bugs, regressions, edge cases, API contract risks, and missing tests.',
  'If the diff looks good, say that explicitly and mention residual risks only.',
].join(' ');

const prompt = [
  `Changed files: ${changedFiles.join(', ') || '(unable to detect from diff)'}`,
  '',
  'Review this diff. Order findings by severity and keep them actionable.',
  '',
  diff,
].join('\n');

const { provider, model, text } = await runPrompt({
  provider: args.provider ?? 'anthropic',
  model: args.model,
  prompt,
  system,
  maxTokens: 2600,
});

if (args.write) {
  const outputPath = writeOutput(args.write, `${text}\n`);
  console.log(`Saved review to ${outputPath}`);
}

console.log(`Provider: ${provider}`);
console.log(`Model: ${model}\n`);
console.log(text);
