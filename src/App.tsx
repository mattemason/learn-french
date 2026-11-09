import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useStore } from '@/state/store';
import { applyTheme } from '@/lib/themes';
import { useReminders } from '@/lib/reminders';
import { Layout } from '@/components/Layout';
import { Celebrations } from '@/components/Celebrations';
import { ConflictDialog } from '@/components/Account';
import { startCloud } from '@/sync/cloud';
import { HomePage } from '@/pages/Home';
import { LearnPage, UnitPage } from '@/pages/Learn';
import { LessonPage, CheckpointPage } from '@/pages/Session';
import { PracticePage, ReviewPage, PracticeSessionPage, ConversationsPage } from '@/pages/Practice';
import { NotebookPage, LibraryArticlePage, VerbPage } from '@/pages/Notebook';
import { ProgressPage } from '@/pages/Progress';
import { ShopPage } from '@/pages/Shop';
import { SettingsPage } from '@/pages/Settings';
import { PlannerPage } from '@/pages/Planner';
import { SchoolPage, SchoolTopicPage } from '@/pages/School';
import { OnboardingPage, PlacementPage } from '@/pages/Onboarding';

function Guard({ children }: { children: JSX.Element }) {
  const onboarded = useStore((s) => s.profile.onboarded);
  const loc = useLocation();
  if (!onboarded && !loc.pathname.startsWith('/onboarding') && !loc.pathname.startsWith('/placement')) return <Navigate to="/onboarding" replace />;
  return children;
}

function Effects() {
  const themeId = useStore((s) => s.profile.themeId);
  const reduced = useStore((s) => s.profile.reducedMotion);
  const touch = useStore((s) => s.touch);
  useEffect(() => applyTheme(themeId), [themeId]);
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced);
  }, [reduced]);
  useEffect(() => {
    touch();
    const onVis = () => document.visibilityState === 'visible' && touch();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [touch]);
  useReminders();
  useEffect(() => startCloud(), []);
  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <Effects />
      <Celebrations />
      <ConflictDialog />
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/placement" element={<PlacementPage />} />
        <Route path="/lesson/:lessonId" element={<Guard><LessonPage /></Guard>} />
        <Route path="/checkpoint/:unitId" element={<Guard><CheckpointPage /></Guard>} />
        <Route path="/review" element={<Guard><ReviewPage /></Guard>} />
        <Route path="/practice/session/:kind" element={<Guard><PracticeSessionPage /></Guard>} />
        <Route element={<Guard><Layout /></Guard>}>
          <Route index element={<HomePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/:unitId" element={<UnitPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/practice/conversations" element={<ConversationsPage />} />
          <Route path="/notebook" element={<NotebookPage />} />
          <Route path="/notebook/library/:id" element={<LibraryArticlePage />} />
          <Route path="/notebook/verbs/:verb" element={<VerbPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/school" element={<SchoolPage />} />
          <Route path="/school/:topicId" element={<SchoolTopicPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
