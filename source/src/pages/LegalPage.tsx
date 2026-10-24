// @ts-nocheck
import { sources, models } from '../data';
import { useParams, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export var LEGAL_DOCS = {
  disclaimer: {
    title: 'Educational disclaimer',
    body: (
      <>
        <p>
          AnatomyVerse 3D is an educational tool. It supports learning and revision but does not replace formal medical
          education, supervised dissection, professional judgement or clinical training.
        </p>
        <p>
          {'The 3D model currently bundled is an original '}
          <strong>schematic</strong>
          {
            ' model. Structures are placed in their general anatomical positions, but their shapes and proportions are simplified and are not anatomically accurate.'
          }
        </p>
        <p>
          {'Educational text has been written from cited open textbooks but is labelled '}
          <em>pending expert review</em>
          {' until checked by a qualified anatomist. Always confirm facts with your course materials.'}
        </p>
        <p>
          Clinical correlations are illustrative teaching examples. They are not diagnoses, and nothing in this
          application is advice about the care of any individual patient.
        </p>
      </>
    ),
  },
  privacy: {
    title: 'Privacy',
    body: (
      <>
        <p>
          AnatomyVerse collects the minimum data needed to run an account: email address, display name, a salted
          password hash, learning preferences and learning progress (bookmarks, flashcard schedules, quiz results,
          lesson progress and recently viewed structures).
        </p>
        <p>Without an account, progress is stored only in your browser’s local storage on this device.</p>
        <p>
          Do not enter patient information or any personal health information. The application is not designed to store
          it.
        </p>
        <p>
          If the optional AI tutor is enabled by the operator, your question and the relevant anatomy records are sent
          to the configured AI provider. Your email and account details are not sent.
        </p>
        <p className="text-[var(--av-text-faint)]">
          Operators deploying AnatomyVerse must publish their own privacy notice describing their hosting location,
          retention period and data controller.
        </p>
      </>
    ),
  },
  terms: {
    title: 'Terms of use',
    body: (
      <>
        <p>
          AnatomyVerse is provided for educational purposes, “as is”, without warranty. You agree not to rely on it for
          clinical decisions.
        </p>
        <p>
          Educational text cites works licensed under Creative Commons Attribution 4.0; see Content sources. The
          schematic 3D model and application code are original works.
        </p>
        <p className="text-[var(--av-text-faint)]">
          Operators deploying AnatomyVerse commercially should replace this page with terms reviewed by a qualified
          lawyer.
        </p>
      </>
    ),
  },
  contact: {
    title: 'Contact',
    body: (
      <>
        <p>No contact address has been configured for this deployment yet.</p>
        <p className="text-[var(--av-text-faint)]">
          Operators: set a support email in this page (src/pages/LegalPage.tsx) before launch. Content corrections
          should be routed to a qualified reviewer via the admin area.
        </p>
      </>
    ),
  },
  sources: {
    title: 'Content sources and licences',
    body: (
      <>
        <p>
          All AnatomyVerse educational text is written in original wording and cites these references for verification:
        </p>
        <ul className="list-disc pl-5">
          {Object.values(sources).map((e) => (
            <li key={e.id}>
              <a className="underline" href={e.url} target="_blank" rel="noreferrer noopener">
                {e.title}
              </a>
              {' — '}
              {e.publisher}
              {e.year ? `, ${e.year}` : ''}
              {'. Licence: '}
              {e.license}.
            </li>
          ))}
        </ul>
        <p>3D models:</p>
        <ul className="list-disc pl-5">
          {models.map((e) => (
            <li key={e.id}>
              {e.name}
              {' — fidelity: '}
              {e.fidelity}
              {'. Licence: '}
              {e.license}.
            </li>
          ))}
        </ul>
      </>
    ),
  },
};

export function LegalPage() {
  let { doc: e = 'disclaimer' } = useParams();
  let t = LEGAL_DOCS[e] ?? LEGAL_DOCS.disclaimer;
  return (
    <div className="min-h-full overflow-y-auto">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link to="/">
          <Logo />
        </Link>
        <Link to="/app/dashboard" className="av-btn av-btn--sm">
          Open app
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16">
        <h1 className="mb-4 text-3xl font-semibold tracking-tight">{t.title}</h1>
        <div className="av-prose flex flex-col gap-3 text-sm leading-relaxed text-[var(--av-text-muted)]">{t.body}</div>
        <nav className="mt-10 flex flex-wrap gap-4 text-sm" aria-label="Legal pages">
          {Object.entries(LEGAL_DOCS).map(([e, t]) => (
            <Link key={e} to={`/legal/${e}`} className="underline">
              {t.title}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
