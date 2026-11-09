import { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { shopItems, MAX_FREEZES, type ShopKind } from '@/lib/game';
import { themes } from '@/lib/themes';
import { useStore } from '@/state/store';
import { Avatar, SectionTitle } from '@/components/ui';
import { fireConfetti } from '@/components/Results';

const SECTIONS: { kind: ShopKind; title: string }[] = [
  { kind: 'theme', title: 'Themes' },
  { kind: 'avatar', title: 'Avatars' },
  { kind: 'frame', title: 'Avatar frames' },
  { kind: 'freeze', title: 'Streak care' },
];

export function ShopPage() {
  const s = useStore();
  const buy = useStore((st) => st.buy);
  const equip = useStore((st) => st.equip);
  const [msg, setMsg] = useState<string | null>(null);
  const equipped = [s.profile.themeId, s.profile.avatarId, s.profile.frameId];

  const purchase = (id: string, name: string) => {
    if (buy(id)) {
      fireConfetti();
      setMsg(`${name} is yours!`);
      if (id !== 'freeze') equip(id);
    } else setMsg('Not enough coins yet — lessons and quests earn more.');
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <div className="animate-rise">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">La Boutique</h1>
          <p className="text-ink-soft">Spend coins on purely cosmetic treats.</p>
        </div>
        <div className="chip bg-sun/20 text-lg px-4 py-2">🪙 {s.coins}</div>
      </div>
      {msg && <div className="card p-3 mt-3 text-center font-bold animate-pop">{msg}</div>}

      {SECTIONS.map((sec) => (
        <section key={sec.kind}>
          <SectionTitle>{sec.title}</SectionTitle>
          <div className={`grid gap-3 ${sec.kind === 'theme' ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {shopItems.filter((i) => i.kind === sec.kind).map((i) => {
              const owned = s.owned.includes(i.id);
              const on = equipped.includes(i.id);
              const t = themes[i.id];
              return (
                <div key={i.id} className={`card p-3 ${on ? 'ring-2 ring-primary' : ''}`}>
                  {i.kind === 'theme' && t && (
                    <div className="h-20 rounded-2xl mb-3 p-3 flex gap-2 items-end" style={{ background: `rgb(${t.vars.bg})`, border: `2px solid rgb(${t.vars.line})` }}>
                      {['primary', 'accent', 'sun', 'sky'].map((k) => <span key={k} className="h-8 flex-1 rounded-xl" style={{ background: `rgb(${t.vars[k]})` }} />)}
                      <span className="h-12 w-10 rounded-xl" style={{ background: `rgb(${t.vars.surface})` }} />
                    </div>
                  )}
                  {i.kind === 'avatar' && <div className="flex justify-center mb-2"><Avatar avatarId={i.id} frameId={s.profile.frameId} size={64} /></div>}
                  {i.kind === 'frame' && <div className="flex justify-center mb-2"><Avatar avatarId={s.profile.avatarId} frameId={i.id} size={64} /></div>}
                  {i.kind === 'freeze' && <div className="text-5xl text-center mb-2">🧊</div>}
                  <div className="font-extrabold">{i.preview && i.kind === 'theme' ? `${i.preview} ` : ''}{i.name}</div>
                  {i.description && <div className="text-xs text-ink-soft">{i.description}</div>}
                  <div className="mt-2">
                    {i.kind === 'freeze' ? (
                      <button className="btn-accent btn-sm w-full" disabled={s.streak.freezes >= MAX_FREEZES || s.coins < i.price} onClick={() => purchase(i.id, i.name)}>
                        {s.streak.freezes >= MAX_FREEZES ? `Full (${s.streak.freezes}/${MAX_FREEZES})` : `🪙 ${i.price} · have ${s.streak.freezes}`}
                      </button>
                    ) : on ? (
                      <div className="btn-sm btn bg-primary/10 text-primary w-full"><Check size={16} /> In use</div>
                    ) : owned ? (
                      <button className="btn-ghost btn-sm w-full" onClick={() => equip(i.id)}>Use</button>
                    ) : (
                      <button className="btn-primary btn-sm w-full" disabled={s.coins < i.price} onClick={() => purchase(i.id, i.name)}>
                        {s.coins < i.price && <Lock size={14} />} 🪙 {i.price}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
