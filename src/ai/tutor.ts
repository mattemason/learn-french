/**
 * Optional AI tutor client. Isolated: nothing in the core curriculum,
 * answer checking, revision or gamification depends on it.
 *
 * Available when the server has ANTHROPIC_API_KEY set, the learner is signed
 * in, and they have switched AI features on in Settings.
 */
import { useCloud, askServer } from '@/sync/cloud';
import { useStore } from '@/state/store';

export type TutorMode = 'explain' | 'correct' | 'chat' | 'help';

export interface TutorRequest {
  mode: TutorMode;
  level?: string;
  englishHelp?: boolean;
  text?: string;
  scenario?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

/** 'ready' | 'off' (learner disabled) | 'login' (needs account) | 'none' (server has no AI) */
export function useAiStatus(): 'ready' | 'off' | 'login' | 'none' {
  const ai = useCloud((s) => s.config.ai);
  const account = useCloud((s) => s.account);
  const enabled = useStore((s) => s.profile.aiEnabled);
  if (!ai) return 'none';
  if (!account) return 'login';
  return enabled ? 'ready' : 'off';
}

export async function askTutor(req: TutorRequest): Promise<string> {
  const data = await askServer<{ text?: string }>('/tutor', req);
  return data.text ?? '';
}
