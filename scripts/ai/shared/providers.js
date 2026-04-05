import { getEnv, requireEnv } from './env.js';

const OPENAI_BASE_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1/messages';

function getAvailableProviders(preferred) {
  const hasOpenAI = Boolean(getEnv('OPENAI_API_KEY'));
  const hasAnthropic = Boolean(getEnv('ANTHROPIC_API_KEY'));

  if (preferred === 'openai') {
    if (!hasOpenAI) throw new Error('OPENAI_API_KEY is missing');
    return ['openai'];
  }

  if (preferred === 'anthropic') {
    if (!hasAnthropic) throw new Error('ANTHROPIC_API_KEY is missing');
    return ['anthropic'];
  }

  const providers = [];
  if (hasAnthropic) providers.push('anthropic');
  if (hasOpenAI) providers.push('openai');

  if (providers.length > 0) return providers;

  throw new Error('No AI provider configured. Add OPENAI_API_KEY or ANTHROPIC_API_KEY to your local env.');
}

function getModelCandidates(provider, explicitModel) {
  if (provider === 'openai') {
    return [...new Set([
      explicitModel,
      getEnv('OPENAI_MODEL'),
      'gpt-4o-mini',
      'gpt-4.1-mini',
    ].filter(Boolean))];
  }

  return [...new Set([
    explicitModel,
    getEnv('ANTHROPIC_MODEL'),
    'claude-sonnet-4-20250514',
    'claude-3-7-sonnet-latest',
    'claude-3-5-sonnet-latest',
  ].filter(Boolean))];
}

async function requestOpenAI({ prompt, system, model, maxTokens, jsonMode }) {
  const apiKey = requireEnv('OPENAI_API_KEY');

  const response = await fetch(OPENAI_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model ?? getEnv('OPENAI_MODEL') ?? 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: maxTokens,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

async function requestAnthropic({ prompt, system, model, maxTokens }) {
  const apiKey = requireEnv('ANTHROPIC_API_KEY');

  const response = await fetch(ANTHROPIC_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model ?? getEnv('ANTHROPIC_MODEL') ?? 'claude-3-5-sonnet-latest',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return (data.content ?? [])
    .filter((item) => item.type === 'text')
    .map((item) => item.text)
    .join('\n')
    .trim();
}

export async function runPrompt(options) {
  const providers = getAvailableProviders(options.provider ?? 'auto');
  const failures = [];

  for (const provider of providers) {
    const models = getModelCandidates(provider, options.model);

    for (const model of models) {
      try {
        const request = {
          ...options,
          model,
          maxTokens: options.maxTokens ?? 2000,
        };

        const text = provider === 'openai'
          ? await requestOpenAI(request)
          : await requestAnthropic(request);

        return { provider, model, text };
      } catch (error) {
        failures.push(`${provider}:${model} -> ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  throw new Error(`All AI provider attempts failed.\n${failures.join('\n')}`);
}
