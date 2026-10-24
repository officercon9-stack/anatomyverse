// @ts-nocheck
import * as React from 'react';
import { lazy, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { fetchServerContent } from '../store/content';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LegalPage } from '../pages/LegalPage';
import { AppLayout } from '../layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { SystemsPage } from '../pages/SystemsPage';
import { SystemDetailPage } from '../pages/SystemDetailPage';
import { LessonsPage } from '../pages/LessonsPage';
import { RevisionPage } from '../pages/RevisionPage';
import { ClinicalListPage, ClinicalCasePage } from '../pages/ClinicalPages';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export var LabPage = lazy(() =>
  import('@/pages/LabPage').then((m) => ({
    default: m.LabPage,
  })),
);

export var LessonPlayerPage = lazy(() =>
  import('@/pages/LessonPlayerPage').then((m) => ({
    default: m.LessonPlayerPage,
  })),
);

export var QuizPage = lazy(() =>
  import('@/pages/QuizPage').then((m) => ({
    default: m.QuizPage,
  })),
);

export var TutorPage = lazy(() =>
  import('@/pages/TutorPage').then((m) => ({
    default: m.TutorPage,
  })),
);

export var AdminPage = lazy(() =>
  import('@/pages/AdminPage').then((m) => ({
    default: m.AdminPage,
  })),
);

export var DictionaryPage = lazy(() =>
  import('@/pages/DictionaryPage').then((m) => ({
    default: m.DictionaryPage,
  })),
);

export function Loading() {
  return (
    <div className="grid h-full min-h-[50vh] place-items-center" role="status">
      <span className="flex items-center gap-2 text-sm text-[var(--av-text-muted)]">
        <LoaderCircle className="animate-spin" size={18} aria-hidden />
        {' Loading…'}
      </span>
    </div>
  );
}

export function App() {
  let e = useAuthStore((e) => e.check);
  let t = useAuthStore((e) => e.backend);
  useEffect(() => {
    e();
  }, [e]);
  useEffect(() => {
    if (t === 'online') {
      fetchServerContent();
    }
  }, [t]);
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/legal/:doc" element={<LegalPage />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="lab" element={<LabPage />} />
            <Route path="systems" element={<SystemsPage />} />
            <Route path="systems/:systemId" element={<SystemDetailPage />} />
            <Route path="lessons" element={<LessonsPage />} />
            <Route path="lessons/:lessonId" element={<LessonPlayerPage />} />
            <Route path="quiz" element={<QuizPage />} />
            <Route path="flashcards" element={<RevisionPage />} />
            <Route path="clinical" element={<ClinicalListPage />} />
            <Route path="clinical/:caseId" element={<ClinicalCasePage />} />
            <Route path="tutor" element={<TutorPage />} />
            <Route path="dictionary" element={<DictionaryPage />} />
            <Route path="account" element={<ProfilePage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </React.Suspense>
    </ErrorBoundary>
  );
}
