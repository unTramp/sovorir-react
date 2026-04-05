#!/usr/bin/env node

import { z } from 'zod';
import { loadLocalEnv } from './shared/env.js';
import { extractJson, parseArgs, readTextFile, writeOutput } from './shared/cli.js';
import { runPrompt } from './shared/providers.js';

const MultipleChoiceQuestionSchema = z.object({
  type: z.literal('multiple-choice'),
  question: z.string().min(1),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().optional(),
});

const MatchPairsQuestionSchema = z.object({
  type: z.literal('match-pairs'),
  pairs: z.array(
    z.object({
      left: z.string().min(1),
      right: z.string().min(1),
    }),
  ).min(2),
});

const QuizSchema = z.object({
  id: z.string().min(1),
  pageId: z.number().int().positive(),
  questions: z.array(z.union([MultipleChoiceQuestionSchema, MatchPairsQuestionSchema])).min(3),
});

loadLocalEnv();

const args = parseArgs(process.argv.slice(2));
const pageId = Number(args.page ?? args._[0]);

if (!Number.isInteger(pageId) || pageId <= 0) {
  console.error('Usage: npm run ai:generate-quiz -- --page <pageId> [--provider openai|anthropic] [--write path]');
  process.exit(1);
}

const lessonPagesSource = readTextFile('src/data/lessonPages.ts');
const quizTypeSource = readTextFile('src/types/quiz.ts');
const quizExamplesSource = readTextFile('src/data/quizzes.ts');

const system = [
  'You generate quiz JSON for an Armenian language learning app.',
  'Return valid JSON only, with no markdown fences and no extra commentary.',
  'Use Russian question text and keep answers pedagogically clear.',
  'Follow the provided schema exactly.',
].join(' ');

const prompt = [
  `Generate a quiz for lesson page ${pageId}.`,
  'Use the lesson content as the source of truth and keep the result compatible with the existing app schema.',
  '',
  'Quiz type schema:',
  quizTypeSource,
  '',
  'Existing quiz examples:',
  quizExamplesSource,
  '',
  'Lesson pages source:',
  lessonPagesSource,
  '',
  `Return a single JSON object for pageId ${pageId}.`,
].join('\n');

const { provider, model, text } = await runPrompt({
  provider: args.provider ?? 'openai',
  model: args.model,
  prompt,
  system,
  maxTokens: 2600,
  jsonMode: true,
});

const parsed = QuizSchema.parse(extractJson(text));
const formatted = `${JSON.stringify(parsed, null, 2)}\n`;

if (args.write) {
  const outputPath = writeOutput(args.write, formatted);
  console.log(`Saved quiz draft to ${outputPath}`);
}

console.log(`Provider: ${provider}`);
console.log(`Model: ${model}\n`);
console.log(formatted);
