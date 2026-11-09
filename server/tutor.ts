/**
 * Optional AI tutor. Enabled only when ANTHROPIC_API_KEY is set.
 * Only signed-in learners can call it, with a per-user daily cap (AI_DAILY_LIMIT).
 *
 *   AI_MODEL        defaults to claude-opus-5-5; claude-haiku-5-5 is far cheaper
 *   AI_DAILY_LIMIT  requests per learner per day (default 40)
 */
import Anthropic from '@anthropic-ai/sdk';
import type { Response } from 'express';
import { query } from './db.js';
import type { AuthedRequest } from './auth.js';

export const aiConfigured = !!process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.AI_MODEL || 'claude-opus-5-5';
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 40);
const MAX_INPUT = 4000;
const client = aiConfigured ? new Anthropic() : null;

type Mode = 'explain' | 'correct' | 'chat' | 'help';
interface Body {
  mode: Mode;
  level?: string;
  englishHelp?: boolean;
  text?: string;
  scenario?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

const BASE = `You are a warm, encouraging French tutor inside a language-learning app for English speakers (teenagers in Queensland senior French and adult learners). Keep French accurate (accents, agreement, elision). Pitch your language to the learner's CEFR level. Be concise — learners are on phones.`;

function systemFor(b: Body): string {
  const level = b.level || 'A1';
  switch (b.mode) {
    case 'explain':
      return `${BASE}\nThe learner (level ${level}) asks about a grammar or vocabulary concept. Explain it in clear English in under 180 words: one-sentence rule, 3 short French examples with translations, and one common mistake to avoid. Use simple markdown (bold, bullet lists).`;
    case 'help':
      return `${BASE}\nThe learner (level ${level}) is stuck on an exercise. Give a hint that leads them towards the answer without simply giving it away, unless they explicitly ask for the answer. Under 100 words, in English.`;
    case 'correct':
      return `${BASE}\nThe learner (level ${level}) wrote a French text. Reply in this structure:\n**Corrected version** — the full text with errors fixed.\n**What changed** — up to 6 bullets, each: the original → the fix, with a short English reason.\n**Well done** — one specific strength.\n**Next step** — one thing to practise.\nDon't rewrite their style beyond what is needed for correctness and naturalness.`;
    case 'chat':
      return `${BASE}\nYou are role-playing a conversation partner in this scenario: ${b.scenario || 'meeting someone new in a café in Lyon'}. Stay in character and reply ONLY in French at level ${level} (short sentences, 1–3 per turn, end with a question to keep the conversation going). ${
        b.englishHelp
          ? 'After your French reply, add a new line starting with "💡" giving a brief English gloss and, if the learner made an error, a gentle correction.'
          : 'If the learner made a significant error, add a short line starting with "💡" with a gentle correction in English.'
      } If the learner writes in English, help them say it in French.`;
  }
}

export async function tutorHandler(req: AuthedRequest, res: Response) {
  if (!client) return res.status(503).json({ error: 'The AI tutor is not set up on this server.' });
  const body = req.body as Body;
  if (!body || !['explain', 'correct', 'chat', 'help'].includes(body.mode)) return res.status(400).json({ error: 'Unknown mode.' });

  // Per-user daily cap keeps running costs predictable.
  const { rows } = await query<{ count: number }>(
    `INSERT INTO ai_usage (user_id, day, count) VALUES ($1, current_date, 1)
     ON CONFLICT (user_id, day) DO UPDATE SET count = ai_usage.count + 1
     RETURNING count`,
    [req.user!.id],
  );
  if (rows[0].count > DAILY_LIMIT) return res.status(429).json({ error: `You've reached today's AI limit (${DAILY_LIMIT}). It resets tomorrow — everything else keeps working.` });

  const history = (body.history ?? []).slice(-12).map((m) => ({ role: m.role === 'assistant' ? 'assistant' as const : 'user' as const, content: String(m.content).slice(0, MAX_INPUT) }));
  const messages: Anthropic.MessageParam[] = body.mode === 'chat' ? history : [{ role: 'user', content: String(body.text ?? '').slice(0, MAX_INPUT) }];
  if (!messages.length || messages[0].role !== 'user') messages.unshift({ role: 'user', content: 'Bonjour !' });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: systemFor(body),
      output_config: { effort: 'low' },
      messages,
    } as Anthropic.MessageCreateParamsNonStreaming);
    if (response.stop_reason === 'refusal') return res.json({ text: "Sorry — I can't help with that one. Try rephrasing your question." });
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    res.json({ text });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'The tutor is busy — try again in a minute.' });
    if (error instanceof Anthropic.AuthenticationError) return res.status(503).json({ error: 'The AI key on the server is invalid.' });
    if (error instanceof Anthropic.APIError) return res.status(502).json({ error: `AI service error (${error.status}).` });
    res.status(502).json({ error: 'Could not reach the AI service.' });
  }
}
