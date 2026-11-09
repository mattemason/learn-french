import { Link } from 'react-router-dom';
import { ArrowRight, Brain, CalendarClock, Clock, Flame, GraduationCap, Sparkles } from 'lucide-react';
import { useStore, dueCards, nextLesson, weakConcepts, currentQuests } from '@/state/store';
import { articleById } from '@/content';
import { dayKey, daysBetween, formatDay } from '@/lib/dates';
import { levelFromXp } from '@/lib/game';
import { Ring, SectionTitle, ProgressBar } from '@/components/ui';
import { QuestList } from '@/components/Quests';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
}

export function HomePage() {
  const s = useStore();
  const today = dayKey();
  const todayXp = s.activity[today]?.xp ?? 0;
  const goal = s.profile.dailyGoalXp;
  const next = nextLesson(s);
  const due = dueCards(s);
  const weak = weakConcepts(s, 3);
  const lvl = levelFromXp(s.xp);
  const quests = currentQuests(s);
  const dailyDone = quests.daily.filter((q) => q.done).length;
  const upcoming = s.plans.filter((p) => !p.done && daysBetween(today, p.date) >= 0).sort((a, b) => a.date.localeCompare(b.date))[0];

  // Recommendation: revision first if a lot is due, otherwise continue the path.
  const recommendReview = due.length >= 12 || (!next && due.length > 0);

  return (
    <div className="animate-rise">
      <section className="mt-2 mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-ink-soft font-bold">{greeting()}{s.profile.name ? `, ${s.profile.name}` : ''} 👋</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
            {todayXp >= goal ? <>Objectif atteint&nbsp;!</> : todayXp > 0 ? <>On continue&nbsp;?</> : <>Prêt pour aujourd'hui&nbsp;?</>}
          </h1>
        </div>
        <Ring value={todayXp / goal} size={78} stroke={8} color="rgb(var(--accent))">
          <div className="text-center leading-none">
            <div className="text-lg font-black">{todayXp}</div>
            <div className="text-[10px] font-extrabold text-ink-soft">/{goal} XP</div>
          </div>
        </Ring>
      </section>

      {/* Primary next step */}
      {recommendReview ? (
        <HeroCard to="/review" kicker="Recommended now" title="Revision time" sub={`${due.length} cards are ready. Reviewing keeps words in long-term memory.`} icon="🧠" cta="Start revision" tone="from-sky to-primary" />
      ) : next ? (
        <HeroCard to={`/lesson/${next.lesson.id}`} kicker={`Continue · ${next.unit.level} · ${next.unit.title}`} title={next.lesson.title} sub={next.lesson.goal} icon={next.unit.emoji} cta={`Start · ${next.lesson.minutes} min`} tone="from-primary to-sun" />
      ) : (
        <HeroCard to="/learn" kicker="You've finished every available lesson" title="Take a checkpoint" sub="Prove what you know and unlock proficiency badges." icon="🎓" cta="Open the map" tone="from-accent to-sky" />
      )}

      <div className="grid grid-cols-2 gap-3 mt-3">
        <Link to="/review" className="card p-4 flex items-center gap-3 active:translate-y-[2px]">
          <Brain className="text-sky shrink-0" />
          <div className="min-w-0"><div className="font-black text-lg leading-none">{due.length}</div><div className="text-xs font-bold text-ink-soft">cards to review</div></div>
        </Link>
        <Link to="/progress" className="card p-4 flex items-center gap-3 active:translate-y-[2px]">
          <Flame className={s.streak.current ? 'text-primary shrink-0' : 'text-ink-soft shrink-0'} />
          <div className="min-w-0"><div className="font-black text-lg leading-none">{s.streak.current} day{s.streak.current === 1 ? '' : 's'}</div><div className="text-xs font-bold text-ink-soft">streak{s.streak.freezes ? ` · 🧊${s.streak.freezes}` : ''}</div></div>
        </Link>
      </div>

      {recommendReview && next && (
        <Link to={`/lesson/${next.lesson.id}`} className="card p-4 mt-3 flex items-center gap-3">
          <span className="text-2xl">{next.unit.emoji}</span>
          <div className="flex-1 min-w-0"><div className="text-xs font-bold text-ink-soft">Or continue your path</div><div className="font-extrabold truncate">{next.lesson.title}</div></div>
          <ArrowRight className="text-ink-soft" />
        </Link>
      )}

      <SectionTitle action={<span className="text-sm font-bold text-ink-soft">{dailyDone}/{quests.daily.length} done</span>}>Daily quests</SectionTitle>
      <div className="card px-4 py-1"><QuestList kind="daily" /></div>

      {(weak.length > 0 || upcoming || s.profile.schoolMode) && <SectionTitle>For you</SectionTitle>}
      <div className="grid gap-3">
        {weak.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center gap-2 font-extrabold"><Sparkles size={18} className="text-primary" /> Needs a little practice</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {weak.map((w) => (
                <Link key={w.id} to={`/notebook/library/${w.id}`} className="chip bg-primary/10 text-primary text-sm py-1.5">{articleById.get(w.id)?.title ?? w.id}</Link>
              ))}
            </div>
            <Link to="/review?focus=concepts" className="btn-ghost btn-sm mt-3">Practise these</Link>
          </div>
        )}
        {upcoming && (
          <Link to="/planner" className="card p-4 flex items-center gap-3">
            <CalendarClock className={upcoming.kind === 'assessment' ? 'text-danger' : 'text-sky'} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-ink-soft">{upcoming.kind === 'assessment' ? 'Upcoming assessment' : 'Planned'} · {formatDay(upcoming.date)}</div>
              <div className="font-extrabold truncate">{upcoming.title}</div>
            </div>
            <span className="chip bg-surface-2">{daysBetween(today, upcoming.date) === 0 ? 'Today' : `in ${daysBetween(today, upcoming.date)}d`}</span>
          </Link>
        )}
        {s.profile.schoolMode && (
          <Link to="/school" className="card p-4 flex items-center gap-3">
            <GraduationCap className="text-accent" />
            <div className="flex-1"><div className="font-extrabold">School French (QCE)</div><div className="text-sm text-ink-soft">Topics, exam-style tasks and assessment tips</div></div>
            <ArrowRight className="text-ink-soft" />
          </Link>
        )}
      </div>

      <SectionTitle>Your game</SectionTitle>
      <Link to="/progress" className="card p-4 block">
        <div className="flex items-center justify-between">
          <div className="font-extrabold">Player level {lvl.level}</div>
          <div className="text-sm font-bold text-ink-soft">{lvl.intoLevel}/{lvl.levelSize} XP</div>
        </div>
        <ProgressBar value={lvl.progress} className="mt-2" color="bg-sun" />
        <div className="flex items-center gap-1.5 text-xs font-bold text-ink-soft mt-3"><Clock size={13} /> XP shows effort. Your CEFR level is earned separately, through checkpoints.</div>
      </Link>
    </div>
  );
}

function HeroCard({ to, kicker, title, sub, icon, cta, tone }: { to: string; kicker: string; title: string; sub: string; icon: string; cta: string; tone: string }) {
  return (
    <Link to={to} className={`block rounded-4xl p-5 sm:p-6 bg-gradient-to-br ${tone} text-white relative overflow-hidden shadow-[0_6px_0_rgb(0_0_0/0.15)] active:translate-y-1 active:shadow-none transition`}>
      <div className="absolute -right-6 -top-6 text-[120px] opacity-25 rotate-12 select-none" aria-hidden>{icon}</div>
      <div className="relative">
        <div className="text-xs font-extrabold uppercase tracking-widest opacity-90">{kicker}</div>
        <div className="font-display text-3xl font-bold mt-1 leading-tight">{title}</div>
        <p className="mt-1 opacity-95 font-semibold max-w-[85%]">{sub}</p>
        <span className="inline-flex items-center gap-2 mt-4 bg-white text-[#2d1838] font-extrabold rounded-2xl px-5 py-3 shadow-[0_4px_0_rgb(0_0_0/0.2)]">{cta} <ArrowRight size={18} /></span>
      </div>
    </Link>
  );
}
