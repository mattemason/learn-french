import { useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { askTutor, useAiStatus, type TutorMode } from '@/ai/tutor';
import { useStore } from '@/state/store';
import { RichText, Sheet } from './ui';

/**
 * A deliberate, learner-initiated AI action. Renders nothing unless the AI
 * tutor is configured for this deployment and switched on in Settings.
 */
export function AiTutorButton({ mode, text, label, disabled }: { mode: TutorMode; text: string; label: string; disabled?: boolean }) {
  const status = useAiStatus();
  const level = useStore((s) => s.placement?.estimate ?? 'A1');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (status !== 'ready') return null;

  const run = async () => {
    setOpen(true);
    setBusy(true);
    setError(null);
    setAnswer(null);
    try {
      setAnswer(await askTutor({ mode, text, level }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="btn-ghost btn-sm" disabled={disabled} onClick={run}><Bot size={16} /> {label}</button>
      <Sheet open={open} onClose={() => setOpen(false)} title="AI tutor">
        {busy && <div className="flex items-center gap-2 text-ink-soft py-6 justify-center"><Loader2 className="animate-spin" /> Thinking…</div>}
        {error && <p className="text-danger font-semibold">{error}</p>}
        {answer && <RichText text={answer} className="leading-relaxed" />}
        <p className="text-xs text-ink-soft mt-4">AI feedback can be imperfect. Your lessons and scores never depend on it.</p>
      </Sheet>
    </>
  );
}
