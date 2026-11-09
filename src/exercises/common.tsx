import { useState, type ReactNode, type RefObject } from 'react';
import { Languages } from 'lucide-react';
import { Portal } from '@/components/ui';

export interface Outcome {
  correct: boolean;
  scored: boolean;
  expected?: string;
  note?: string;
  /** Multi-part exercises (reading, conjugation, dialogue) report each part. */
  parts?: boolean[];
}

export interface ExProps<E> {
  ex: E;
  onDone: (o: Outcome) => void;
  locked: boolean;
  englishAlways: boolean;
  autoplay: boolean;
  testMode: boolean;
}

const ACCENTS = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ù', 'û', 'ô', 'î', 'ï', 'ë', 'œ'];

export function AccentBar({ target, value, onChange }: { target: RefObject<HTMLInputElement | HTMLTextAreaElement>; value: string; onChange: (v: string) => void }) {
  const insert = (ch: string) => {
    const el = target.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + ch + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + 1, start + 1);
    });
  };
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1" aria-label="Accented letters">
      {ACCENTS.map((a) => (
        <button key={a} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insert(a)}
          className="h-10 min-w-10 px-2 rounded-xl bg-surface-2 font-bold text-lg active:translate-y-[2px]">{a}</button>
      ))}
    </div>
  );
}

export function EnglishToggle({ text, always }: { text?: string; always: boolean }) {
  const [show, setShow] = useState(always);
  if (!text) return null;
  return show ? (
    <p className="text-ink-soft text-[15px] mt-1 italic">{text}</p>
  ) : (
    <button type="button" onClick={() => setShow(true)} className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-ink-soft underline decoration-dotted underline-offset-4">
      <Languages size={14} /> Show English
    </button>
  );
}

export function CheckBar({ disabled, onCheck, label = 'Check', locked, extra }: { disabled?: boolean; onCheck: () => void; label?: string; locked: boolean; extra?: ReactNode }) {
  if (locked) return null;
  return (
    <Portal>
      <div className="fixed inset-x-0 bottom-0 z-30 bg-bg/95 backdrop-blur border-t border-line safe-bottom">
        <div className="mx-auto max-w-2xl px-4 py-3 flex gap-3">
          {extra}
          <button className="btn-primary flex-1" disabled={disabled} onClick={onCheck}>{label}</button>
        </div>
      </div>
    </Portal>
  );
}

export function Prompt({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <div className="label mb-2">{kicker}</div>
      <div className="font-display text-2xl sm:text-3xl font-bold leading-snug">{children}</div>
    </div>
  );
}
