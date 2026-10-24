// @ts-nocheck
import * as React from 'react';
import { lazy } from 'react';
import {
  Boxes,
  Search,
  BookOpen,
  Layers,
  Stethoscope,
  Brain,
  GraduationCap,
  Target,
  Zap,
  ArrowRight,
  LoaderCircle,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { modelById, SCHEMATIC_MODEL_ID as DEFAULT_MODEL_ID, structuresInModel, structures } from '../data';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import { LESSONS } from '../data/lessons';
import { QUESTIONS } from '../data/questions';
import { SYSTEMS } from '../data/systems';

export var ViewerPreview = lazy(() =>
  import('@/viewer/ViewerPreview').then((m) => ({
    default: m.ViewerPreview,
  })),
);

export var HOME_FEATURES = [
  {
    icon: Boxes,
    title: 'Interactive 3D laboratory',
    text: 'Rotate, zoom and pan; select structures; peel back layers; isolate and hide structures; switch standard anatomical views.',
  },
  {
    icon: Search,
    title: 'Anatomy search',
    text: 'Find structures by common name, synonym, Latin term, region or system — with clear labels when no 3D object exists yet.',
  },
  {
    icon: BookOpen,
    title: 'Guided lessons',
    text: 'Step-by-step lessons that move the camera, show the right layers and check understanding as you go.',
  },
  {
    icon: Layers,
    title: 'Relationship explorer',
    text: 'See what articulates with, innervates, supplies or drains into each structure — and jump to it in 3D.',
  },
  {
    icon: Stethoscope,
    title: 'Clinical correlations',
    text: 'Short educational cases connecting anatomy to fractures, nerve injuries and common clinical landmarks.',
  },
  {
    icon: Brain,
    title: 'Tutor with offline fallback',
    text: 'Ask about the selected structure at beginner, medical-student or advanced level. Works without an AI service.',
  },
];

export var HOME_FEATURES_2 = [
  {
    icon: GraduationCap,
    title: 'Examination mode',
    text: 'Randomised, timed papers with configurable length, topic breakdown and review of incorrect answers.',
  },
  {
    icon: Target,
    title: 'Identification practice',
    text: 'Name highlighted structures or click the right one on the model — like a practical spotter exam.',
  },
  {
    icon: Zap,
    title: 'Spaced-repetition flashcards',
    text: 'Generate cards from any structure; a documented SM-2 schedule brings them back when you are due.',
  },
];

export var HOME_AUDIENCES = [
  'Medical students',
  'Health-science undergraduates',
  'Nursing students',
  'Anatomy educators',
  'Exam candidates',
  'Clinicians revising anatomy',
];

export function HomePage() {
  let e = modelById[DEFAULT_MODEL_ID];
  let t = structuresInModel(e).size;
  return (
    <div className="min-h-full overflow-y-auto bg-[var(--av-bg)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <nav aria-label="Primary" className="flex items-center gap-2">
          <Link to="/app/lab" className="av-btn av-btn--primary av-btn--sm">
            Open the lab
          </Link>
        </nav>
      </header>
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-12">
          <div>
            <p className="av-kicker mb-3">Interactive anatomy for medical education</p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Explore the human body in three dimensions — then prove you know it.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--av-text-muted)]">
              AnatomyVerse 3D combines an interactive anatomy viewer with structured content, guided lessons,
              practical-style identification, exam practice and spaced-repetition revision.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/app/lab" className="av-btn av-btn--primary h-11 px-5 text-[0.95rem]">
                {'Explore anatomy '}
                <ArrowRight size={17} aria-hidden />
              </Link>
              <Link to="/app/lessons/heart-chambers-blood-flow" className="av-btn h-11 px-5 text-[0.95rem]">
                Start learning
              </Link>
            </div>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-[var(--av-text-faint)]">Structures</dt>
                <dd className="text-xl font-semibold">{structures.length}</dd>
              </div>
              <div>
                <dt className="text-[var(--av-text-faint)]">In 3D model</dt>
                <dd className="text-xl font-semibold">{t}</dd>
              </div>
              <div>
                <dt className="text-[var(--av-text-faint)]">Lessons · questions</dt>
                <dd className="text-xl font-semibold">
                  {LESSONS.length}
                  {' · '}
                  {QUESTIONS.length}
                </dd>
              </div>
            </dl>
          </div>
          <div className="av-card relative aspect-[4/5] overflow-hidden sm:aspect-[5/5]">
            <React.Suspense
              fallback={
                <div className="grid h-full place-items-center">
                  <LoaderCircle className="animate-spin text-[var(--av-text-faint)]" aria-label="Loading 3D preview" />
                </div>
              }
            >
              <ViewerPreview />
            </React.Suspense>
          </div>
        </section>
        <section className="border-y border-[var(--av-border)] bg-[var(--av-bg-elevated)]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <p className="av-kicker mb-2">Anatomical systems</p>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight">Twelve systems, with honest coverage</h2>
            <p className="mb-6 max-w-2xl text-sm text-[var(--av-text-muted)]">
              Each system page states exactly which structures have 3D objects and which are text-only today.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SYSTEMS.map((e) => {
                let t = structures.filter((t) => t.system === e.id).length;
                return (
                  <li key={e.id}>
                    <Link
                      to={`/app/systems/${e.id}`}
                      className="av-card flex h-full flex-col gap-1 p-4 transition hover:border-[var(--av-teal)]"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background: e.color,
                          }}
                          aria-hidden
                        />
                        {e.name}
                      </span>
                      <span className="text-xs text-[var(--av-text-muted)]">{e.summary}</span>
                      <span className="mt-auto pt-2 text-xs text-[var(--av-text-faint)]">
                        {t}
                        {' structure records'}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="av-kicker mb-2">Learning features</p>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Built for understanding, not just looking</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_FEATURES.map(({ icon: e, title: t, text: n }) => (
              <li key={t} className="av-card p-5">
                <e size={20} className="mb-3 text-[var(--av-teal)]" aria-hidden />
                <h3 className="mb-1 font-semibold">{t}</h3>
                <p className="text-sm leading-relaxed text-[var(--av-text-muted)]">{n}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="border-y border-[var(--av-border)] bg-[var(--av-bg-elevated)]">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
            <div>
              <p className="av-kicker mb-2">Examination preparation</p>
              <h2 className="mb-6 text-2xl font-semibold tracking-tight">Practise the way you are assessed</h2>
              <ul className="flex flex-col gap-4">
                {HOME_FEATURES_2.map(({ icon: e, title: t, text: n }) => (
                  <li key={t} className="flex gap-3">
                    <e size={20} className="mt-0.5 shrink-0 text-[var(--av-cyan)]" aria-hidden />
                    <div>
                      <h3 className="font-semibold">{t}</h3>
                      <p className="text-sm text-[var(--av-text-muted)]">{n}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="av-kicker mb-2">Who it is for</p>
              <h2 className="mb-6 text-2xl font-semibold tracking-tight">Intended users</h2>
              <ul className="grid grid-cols-2 gap-2">
                {HOME_AUDIENCES.map((e) => (
                  <li key={e} className="av-card flex items-center gap-2 p-3 text-sm">
                    <Users size={15} className="text-[var(--av-teal)]" aria-hidden />
                    {e}
                  </li>
                ))}
              </ul>
              <div className="av-card mt-6 flex gap-3 p-4 text-sm">
                <ShieldCheck size={20} className="shrink-0 text-[var(--av-warn)]" aria-hidden />
                <p className="text-[var(--av-text-muted)]">
                  <strong className="text-[var(--av-text)]">Honest by design.</strong>
                  {
                    ' The current 3D model is an original schematic, not an anatomically accurate atlas. Content is written from cited open textbooks and is labelled as pending expert review.'
                  }
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-[var(--av-text-muted)] sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <Logo />
          <nav aria-label="Footer" className="flex flex-wrap gap-4">
            <Link to="/legal/privacy" className="hover:text-[var(--av-text)]">
              Privacy
            </Link>
            <Link to="/legal/terms" className="hover:text-[var(--av-text)]">
              Terms
            </Link>
            <Link to="/legal/contact" className="hover:text-[var(--av-text)]">
              Contact
            </Link>
            <Link to="/legal/disclaimer" className="hover:text-[var(--av-text)]">
              Educational disclaimer
            </Link>
            <Link to="/legal/sources" className="hover:text-[var(--av-text)]">
              Content sources
            </Link>
          </nav>
        </div>
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-[var(--av-text-faint)]">
          AnatomyVerse 3D supports learning. It does not replace formal medical education, supervised dissection,
          professional judgement or clinical training, and it does not provide diagnosis or treatment advice.
        </p>
      </footer>
    </div>
  );
}
