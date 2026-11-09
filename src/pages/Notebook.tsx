import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { allVocab, articleById, articles, verbByInfinitive, verbs, vocabById, withArticle } from '@/content';
import type { LibraryArticle, LibraryCategory, TenseKey } from '@/content/types';
import { useStore, type CustomCard } from '@/state/store';
import { strength } from '@/lib/srs';
import { normalize, stripAccents } from '@/lib/answer';
import { AudioButton, Empty, Sheet } from '@/components/ui';

const CAT_LABEL: Record<LibraryCategory, string> = {
  grammar: 'Grammar', verbs: 'Verbs', tenses: 'Tenses', pronunciation: 'Pronunciation', expressions: 'Expressions', 'sentence-structure': 'Sentences', vocabulary: 'Vocabulary',
};

const fold = (s: string) => stripAccents(normalize(s));

export function NotebookPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as 'words' | 'cards' | 'library' | 'verbs') || 'words';
  const set = (t: string) => setParams({ tab: t }, { replace: true });
  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-bold">Notebook</h1>
      <p className="text-ink-soft">Your words, your flashcards, and the French Mastery Library.</p>
      <div className="grid grid-cols-4 gap-1 p-1 mt-4 rounded-2xl bg-surface-2">
        {([['words', 'Words'], ['cards', 'Flashcards'], ['library', 'Library'], ['verbs', 'Verbs']] as const).map(([k, l]) => (
          <button key={k} onClick={() => set(k)} className={`rounded-xl py-2 text-sm font-extrabold ${tab === k ? 'bg-surface shadow text-ink' : 'text-ink-soft'}`}>{l}</button>
        ))}
      </div>
      <div className="mt-4">
        {tab === 'words' && <Words />}
        {tab === 'cards' && <Cards />}
        {tab === 'library' && <Library />}
        {tab === 'verbs' && <Verbs />}
      </div>
    </div>
  );
}

function Words() {
  const s = useStore();
  const toggle = useStore((st) => st.toggleSaved);
  const [q, setQ] = useState('');
  const [scope, setScope] = useState<'saved' | 'learned' | 'all'>('learned');
  const learned = new Set(Object.keys(s.srs).filter((k) => k.startsWith('v:')).map((k) => k.slice(2)));
  const list = allVocab
    .filter((v) => (scope === 'saved' ? s.saved.includes(v.id) : scope === 'learned' ? learned.has(v.id) || s.saved.includes(v.id) : true))
    .filter((v) => !q || fold(v.fr).includes(fold(q)) || fold(v.en).includes(fold(q)));
  return (
    <>
      <SearchBox value={q} onChange={setQ} placeholder="Search French or English…" />
      <div className="flex gap-2 my-3">
        {([['learned', `Learned (${learned.size})`], ['saved', `Saved (${s.saved.length})`], ['all', `All (${allVocab.length})`]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setScope(k)} className={`chip py-1.5 px-3 text-sm ${scope === k ? 'bg-ink text-bg' : 'bg-surface border border-line'}`}>{l}</button>
        ))}
      </div>
      {!list.length ? (
        <Empty icon="🔖" title={scope === 'saved' ? 'No saved words yet' : 'No words here yet'}>Words appear as you complete lessons. Tap the bookmark on any word to save it.</Empty>
      ) : (
        <div className="card divide-y divide-line">
          {list.slice(0, 300).map((v) => {
            const c = s.srs['v:' + v.id];
            const st = c ? strength(c) : null;
            return (
              <div key={v.id} className="flex items-center gap-3 px-3 py-2.5">
                <AudioButton text={withArticle(v)} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold">{withArticle(v)}</div>
                  <div className="text-sm text-ink-soft truncate">{v.en}{v.example ? ` · ${v.example.fr}` : ''}</div>
                </div>
                {st && <span className={`chip text-[10px] ${st === 'mastered' ? 'bg-accent/15 text-accent' : st === 'strong' ? 'bg-sky/15 text-sky' : 'bg-surface-2 text-ink-soft'}`}>{st}</span>}
                <button onClick={() => toggle(v.id)} aria-label={s.saved.includes(v.id) ? 'Unsave' : 'Save'} className={`h-9 w-9 grid place-items-center rounded-xl ${s.saved.includes(v.id) ? 'text-primary' : 'text-ink-soft'}`}>
                  {s.saved.includes(v.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function Cards() {
  const s = useStore();
  const add = useStore((st) => st.addCustomCard);
  const update = useStore((st) => st.updateCustomCard);
  const del = useStore((st) => st.deleteCustomCard);
  const [editing, setEditing] = useState<Partial<CustomCard> | null>(null);
  const cards = Object.values(s.customCards).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const decks = [...new Set(cards.map((c) => c.deck))];
  const save = () => {
    if (!editing?.front?.trim() || !editing.back?.trim()) return;
    const deck = editing.deck?.trim() || 'My cards';
    if (editing.id) update(editing.id, { front: editing.front, back: editing.back, note: editing.note, deck });
    else add({ front: editing.front.trim(), back: editing.back.trim(), note: editing.note?.trim(), deck });
    setEditing(null);
  };
  return (
    <>
      <div className="flex gap-2">
        <button className="btn-primary flex-1" onClick={() => setEditing({ deck: decks[0] ?? 'My cards' })}><Plus size={18} /> New flashcard</button>
        <Link to="/review?focus=custom" className="btn-ghost">Review due</Link>
      </div>
      <p className="text-sm text-ink-soft mt-2">Tip: at the end of any lesson you can create a deck from its example sentences.</p>
      {!cards.length ? <div className="mt-4"><Empty icon="🃏" title="No flashcards yet">Make your own cards for anything you want to remember.</Empty></div> : decks.map((d) => (
        <div key={d} className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <div className="font-display text-lg font-bold">{d}</div>
            <Link to={`/review?deck=${encodeURIComponent(d)}`} className="btn-ghost btn-sm">Study deck</Link>
          </div>
          <div className="grid gap-2">
            {cards.filter((c) => c.deck === d).map((c) => (
              <div key={c.id} className="card p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold truncate">{c.front}</div>
                  <div className="text-sm text-ink-soft truncate">{c.back}</div>
                </div>
                <button aria-label="Edit" onClick={() => setEditing(c)} className="h-9 w-9 grid place-items-center rounded-xl text-ink-soft"><Pencil size={16} /></button>
                <button aria-label="Delete" onClick={() => confirm('Delete this card?') && del(c.id)} className="h-9 w-9 grid place-items-center rounded-xl text-danger"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit flashcard' : 'New flashcard'}>
        <div className="grid gap-3">
          <label><span className="label">Front (French)</span><input className="input mt-1" lang="fr" value={editing?.front ?? ''} onChange={(e) => setEditing({ ...editing, front: e.target.value })} /></label>
          <label><span className="label">Back (meaning)</span><input className="input mt-1" value={editing?.back ?? ''} onChange={(e) => setEditing({ ...editing, back: e.target.value })} /></label>
          <label><span className="label">Note (optional)</span><input className="input mt-1" value={editing?.note ?? ''} onChange={(e) => setEditing({ ...editing, note: e.target.value })} /></label>
          <label><span className="label">Deck</span><input className="input mt-1" list="decks" value={editing?.deck ?? ''} onChange={(e) => setEditing({ ...editing, deck: e.target.value })} />
            <datalist id="decks">{decks.map((d) => <option key={d} value={d} />)}</datalist></label>
          <button className="btn-primary" onClick={save} disabled={!editing?.front?.trim() || !editing?.back?.trim()}>Save</button>
        </div>
      </Sheet>
    </>
  );
}

function articleText(a: LibraryArticle) {
  return fold([a.title, a.summary, ...a.tags, ...a.blocks.map((b) => ('text' in b ? b.text : 'items' in b ? b.items.map((i) => i.fr + ' ' + i.en).join(' ') : b.rows.flat().join(' ')))].join(' '));
}

function Library() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<LibraryCategory | 'all'>('all');
  const read = useStore((s) => s.libraryRead);
  const index = useMemo(() => articles.map((a) => ({ a, text: articleText(a) })), []);
  const list = index.filter(({ a, text }) => (cat === 'all' || a.category === cat) && (!q || fold(q).split(' ').every((w) => text.includes(w)))).map((x) => x.a);
  const cats = [...new Set(articles.map((a) => a.category))];
  return (
    <>
      <SearchBox value={q} onChange={setQ} placeholder="Search grammar, tenses, expressions…" />
      <div className="flex gap-2 my-3 overflow-x-auto no-scrollbar">
        <button onClick={() => setCat('all')} className={`chip py-1.5 px-3 text-sm shrink-0 ${cat === 'all' ? 'bg-ink text-bg' : 'bg-surface border border-line'}`}>All</button>
        {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`chip py-1.5 px-3 text-sm shrink-0 ${cat === c ? 'bg-ink text-bg' : 'bg-surface border border-line'}`}>{CAT_LABEL[c]}</button>)}
      </div>
      <div className="grid gap-2">
        {list.map((a) => (
          <Link key={a.id} to={`/notebook/library/${a.id}`} className="card p-4 flex items-start gap-3">
            <span className="chip bg-ink text-bg shrink-0 mt-0.5">{a.level}</span>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold">{a.title} {read.includes(a.id) && <span className="text-accent text-sm">✓</span>}</div>
              <div className="text-sm text-ink-soft">{a.summary}</div>
            </div>
          </Link>
        ))}
        {!list.length && <Empty icon="🔎" title="No matches">Try another word — search works in English and French.</Empty>}
      </div>
    </>
  );
}

export function LibraryArticlePage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const a = articleById.get(id);
  const markRead = useStore((s) => s.markLibraryRead);
  useEffect(() => {
    if (!a) return;
    const t = setTimeout(() => markRead(a.id), 4000);
    return () => clearTimeout(t);
  }, [a, markRead]);
  if (!a) return <Empty icon="📚" title="Article not found" />;
  return (
    <article className="animate-rise">
      <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm font-extrabold text-ink-soft mb-3"><ArrowLeft size={16} /> Back</button>
      <div className="flex gap-2 mb-2"><span className="chip bg-ink text-bg">{a.level}</span><span className="chip bg-surface-2">{CAT_LABEL[a.category]}</span></div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold">{a.title}</h1>
      <p className="text-lg text-ink-soft mt-1">{a.summary}</p>
      <div className="space-y-4 mt-6">
        {a.blocks.map((b, i) => {
          switch (b.kind) {
            case 'p': return <p key={i} className="text-[17px] leading-relaxed">{b.text}</p>;
            case 'tip': return <div key={i} className="rounded-3xl bg-accent/10 border-2 border-accent/30 p-4"><span className="font-extrabold">💡 Tip · </span>{b.text}</div>;
            case 'warning': return <div key={i} className="rounded-3xl bg-danger/10 border-2 border-danger/30 p-4"><span className="font-extrabold">⚠️ Watch out · </span>{b.text}</div>;
            case 'examples': return (
              <div key={i} className="card divide-y divide-line">
                {b.items.map((e, j) => (
                  <div key={j} className="flex items-center gap-3 p-3">
                    <AudioButton text={e.fr} size="sm" />
                    <div><div className="font-bold" lang="fr">{e.fr}</div><div className="text-sm text-ink-soft">{e.en}</div></div>
                  </div>
                ))}
              </div>
            );
            case 'table': return (
              <div key={i} className="card overflow-x-auto">
                <table className="w-full text-left text-[15px]">
                  <thead className="bg-surface-2"><tr>{b.head.map((h, j) => <th key={j} className="px-3 py-2 font-extrabold">{h}</th>)}</tr></thead>
                  <tbody>{b.rows.map((r, j) => <tr key={j} className="border-t border-line">{r.map((c, k) => <td key={k} className={`px-3 py-2 ${k === 0 ? 'font-bold' : ''}`}>{c}</td>)}</tr>)}</tbody>
                </table>
              </div>
            );
          }
        })}
      </div>
      {a.related && a.related.length > 0 && (
        <div className="mt-8">
          <div className="label mb-2">Related</div>
          <div className="flex flex-wrap gap-2">{a.related.filter((r) => articleById.has(r)).map((r) => <Link key={r} to={`/notebook/library/${r}`} className="chip bg-primary/10 text-primary py-1.5 text-sm">{articleById.get(r)!.title}</Link>)}</div>
        </div>
      )}
    </article>
  );
}

function Verbs() {
  const [q, setQ] = useState('');
  const list = verbs.filter((v) => !q || fold(v.infinitive).includes(fold(q)) || fold(v.en).includes(fold(q)));
  return (
    <>
      <SearchBox value={q} onChange={setQ} placeholder="Find a verb (e.g. aller, to go)…" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
        {list.map((v) => (
          <Link key={v.infinitive} to={`/notebook/verbs/${encodeURIComponent(v.infinitive)}`} className="card p-3">
            <div className="font-extrabold">{v.infinitive}</div>
            <div className="text-sm text-ink-soft truncate">{v.en}</div>
            <div className="flex gap-1 mt-1"><span className="chip bg-surface-2 text-[10px]">{v.group === 'irregular' ? 'irrégulier' : `-${v.group}`}</span><span className="chip bg-surface-2 text-[10px]">{v.level}</span></div>
          </Link>
        ))}
      </div>
    </>
  );
}

const TENSES: { key: TenseKey; label: string }[] = [
  { key: 'present', label: 'Présent' }, { key: 'passe-compose', label: 'Passé composé' }, { key: 'imparfait', label: 'Imparfait' },
  { key: 'futur-simple', label: 'Futur simple' }, { key: 'conditionnel', label: 'Conditionnel' }, { key: 'subjonctif', label: 'Subjonctif' }, { key: 'imperatif', label: 'Impératif' },
];

function withPronoun(p: string, form: string, tense: TenseKey) {
  const pre = tense === 'subjonctif' ? (p === 'je' && /^[aeiouhéèêœy]/i.test(form) ? "que j'" : p === 'il/elle/on' || p === 'ils/elles' ? 'qu\'' + p : 'que ' + p) : p;
  if (tense !== 'subjonctif' && p === 'je' && /^[aeiouhéèêœy]/i.test(form)) return `j'${form}`;
  return tense === 'subjonctif' && pre.endsWith("'") ? `${pre}${form}` : `${pre} ${form}`;
}

export function VerbPage() {
  const { verb = '' } = useParams();
  const nav = useNavigate();
  const v = verbByInfinitive.get(decodeURIComponent(verb));
  const [tense, setTense] = useState<TenseKey>('present');
  if (!v) return <Empty icon="🧩" title="Verb not found" />;
  const forms = v.tenses[tense] ?? [];
  const persons = tense === 'imperatif' ? ['(tu)', '(nous)', '(vous)'] : ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles'];
  const vocabMatch = [...vocabById.values()].find((x) => x.pos === 'verb' && x.fr === v.infinitive);
  return (
    <div className="animate-rise">
      <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm font-extrabold text-ink-soft mb-3"><ArrowLeft size={16} /> Back</button>
      <div className="flex items-center gap-3">
        <AudioButton text={v.infinitive} />
        <div>
          <h1 className="font-display text-4xl font-bold">{v.infinitive}</h1>
          <div className="text-ink-soft font-semibold">{v.en} · {v.group === 'irregular' ? 'irregular' : `-${v.group} verb`} · auxiliary <b>{v.auxiliary}</b> · participle <b>{v.participle}</b></div>
        </div>
      </div>
      {v.notes && <div className="rounded-3xl bg-sun/15 border-2 border-sun/40 p-4 mt-4 text-[15px]">📝 {v.notes}</div>}
      <div className="flex gap-2 mt-5 overflow-x-auto no-scrollbar">
        {TENSES.filter((t) => v.tenses[t.key]?.length).map((t) => (
          <button key={t.key} onClick={() => setTense(t.key)} className={`chip py-2 px-3 text-sm shrink-0 ${tense === t.key ? 'bg-primary text-primary-ink' : 'bg-surface border border-line'}`}>{t.label}</button>
        ))}
      </div>
      <div className="card divide-y divide-line mt-3">
        {forms.map((f, i) => {
          const full = tense === 'imperatif' ? f : withPronoun(persons[i], f, tense);
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <AudioButton text={full.replace('il/elle/on', 'il').replace('ils/elles', 'ils')} size="sm" />
              <span className="text-lg"><span className="text-ink-soft">{tense === 'imperatif' ? persons[i] + ' ' : ''}</span><span className="font-extrabold">{full}</span></span>
            </div>
          );
        })}
      </div>
      <Link to={`/practice/session/verbs:${tense}`} className="btn-primary w-full mt-4">Drill {TENSES.find((t) => t.key === tense)?.label}</Link>
      {vocabMatch?.example && <p className="text-sm text-ink-soft mt-4">Example: <i>{vocabMatch.example.fr}</i> — {vocabMatch.example.en}</p>}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
      <input className="input pl-11" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type="search" />
    </label>
  );
}
