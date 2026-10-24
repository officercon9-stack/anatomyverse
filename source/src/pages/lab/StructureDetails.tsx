// @ts-nocheck
import { REFERENCES, TA2_SOURCE } from '../../data/references';
import {
  Languages,
  Box,
  BookmarkCheck,
  Bookmark,
  ListChecks,
  ListPlus,
  Zap,
  EyeOff,
  Eye,
  Crosshair,
  Focus,
  HeartPulse,
  Stethoscope,
  GraduationCap,
} from 'lucide-react';
import { getStructure, structureById } from '../../data';
import { useContentStore } from '../../store/content';
import { useProgressStore } from '../../store/progress';
import { useViewerStore } from '../../store/viewerStore';
import { useHasModel3D } from '../../store/viewerHooks';
import { cardsForMistake } from '../../lib/flashcards';
import { relationsOf } from '../../data/relationships';
import { QUESTIONS } from '../../data/questions';
import { CLINICAL_CASES } from '../../data/clinicalCases';
import { resolveVisibility } from '../../store/visibility';
import { systemById } from '../../data/systems';
import { ReviewBadge } from '../../components/ReviewBadge';
import { HEART_IDS, BRAIN_IDS, LUNG_IDS } from './regions';
import { switchModel, showDiaphragm } from './views';
import { Link } from 'react-router-dom';
import { SourceList } from '../../components/SourceList';

export var TRANSLATION_LANGUAGES = [
  {
    key: 'la',
    label: 'Latin',
  },
  {
    key: 'fa',
    label: 'فارسی Persian',
    rtl: true,
  },
  {
    key: 'fr',
    label: 'Français',
  },
  {
    key: 'es',
    label: 'Español',
  },
  {
    key: 'pt',
    label: 'Português',
  },
  {
    key: 'it',
    label: 'Italiano',
  },
];

export function TranslationsSection({ structureId: e }) {
  let t = REFERENCES[e];
  if (t) {
    return (
      <section aria-labelledby="ta2-title" className="rounded-xl border border-[var(--av-border)] p-3">
        <h3 id="ta2-title" className="av-section-title mb-2 flex items-center gap-1.5">
          <Languages size={13} aria-hidden />
          {' Terminologia Anatomica (TA2)'}
        </h3>
        <p className="mb-2 text-sm">
          <span className="font-medium">{t.en}</span>{' '}
          <span className="av-badge ml-1">
            {'TA2 ID '}
            {t.ta2}
          </span>
        </p>
        <dl className="grid grid-cols-[6.5rem_1fr] gap-x-2 gap-y-1 text-sm">
          {TRANSLATION_LANGUAGES.filter((e) => t[e.key]).map((e) => (
            <div key={e.key} className="contents">
              <dt className="text-xs text-[var(--av-text-faint)]">{e.label}</dt>
              <dd
                dir={e.rtl ? 'rtl' : undefined}
                lang={e.key}
                className={e.key === 'la' ? 'italic' : e.rtl ? 'text-right' : ''}
              >
                {t[e.key]}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-[11px] leading-snug text-[var(--av-text-faint)]">
          {'Source: '}
          <a className="underline" href={TA2_SOURCE.url} target="_blank" rel="noreferrer noopener">
            {TA2_SOURCE.title}
          </a>
          {' ('}
          {TA2_SOURCE.license}). Translations by Z-Anatomy contributors; verify with your course.
        </p>
      </section>
    );
  } else {
    return null;
  }
}

export function Field({ label: e, children: t }) {
  return (
    <div>
      <dt className="av-section-title mb-1">{e}</dt>
      <dd className="text-sm leading-relaxed text-[var(--av-text)]">{t}</dd>
    </div>
  );
}

export function RelatedChip({ id: e, onPick: t }) {
  let n = getStructure(e);
  if (n) {
    return (
      <button
        type="button"
        className="av-badge hover:border-[var(--av-teal)] hover:text-[var(--av-teal)]"
        onClick={() => t(e)}
      >
        {n.name}
      </button>
    );
  } else {
    return null;
  }
}

export function StructureDetails({ structureId: e, onPick: t }) {
  useContentStore((e) => e.v);
  let n = structureById[e];
  let {
    bookmarks: r,
    revision: a,
    flashcards: o,
    toggleBookmark: s,
    toggleRevision: l,
    addFlashcards: f,
  } = useProgressStore();
  let p = useViewerStore();
  let m = useHasModel3D();
  if (!n) {
    return <p className="p-4 text-sm text-[var(--av-text-muted)]">Unknown structure.</p>;
  }
  let h = p.mode === 'identify';
  let _ = r.includes(n.id);
  let y = a.includes(n.id);
  let S = cardsForMistake(n);
  let w = S.every((e) => o[e.id]);
  let O = relationsOf(n.id);
  let j = QUESTIONS.filter((e) => e.relatedStructureIds.includes(n.id));
  let M = CLINICAL_CASES.filter((e) => e.relevantStructureIds.includes(n.id));
  let P = m(n.id);
  let F = resolveVisibility(n.id, p, structureById).visible;
  let L = n.childIds ?? [];
  if (h) {
    return (
      <div className="p-4 text-sm text-[var(--av-text-muted)]">
        Identification mode: details are hidden until you answer.
      </div>
    );
  } else {
    return (
      <article className="flex flex-col gap-4 p-4" aria-labelledby="structure-title">
        <header>
          <p className="av-kicker mb-1">
            {systemById[n.system]?.name}
            {' system'}
          </p>
          <h2 id="structure-title" className="text-xl font-semibold tracking-tight">
            {n.name}
          </h2>
          {n.latinName && <p className="text-sm italic text-[var(--av-text-muted)]">{n.latinName}</p>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <ReviewBadge status={n.reviewStatus} />
            {P ? (
              <span className="av-badge av-badge--accent">
                <Box size={12} aria-hidden />
                {' In 3D model'}
              </span>
            ) : (
              <span
                className="av-badge"
                title="This structure exists in the educational database but has no object in the current 3D model."
              >
                No 3D object in current model
              </span>
            )}
            <span className="av-badge">{n.region.replace('-', ' ')}</span>
          </div>
          {n.synonyms?.length ? (
            <p className="mt-2 text-xs text-[var(--av-text-faint)]">
              {'Also: '}
              {n.synonyms.join(', ')}
            </p>
          ) : null}
        </header>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="av-btn av-btn--sm" aria-pressed={_} onClick={() => s(n.id)}>
            {_ ? <BookmarkCheck size={15} aria-hidden /> : <Bookmark size={15} aria-hidden />} {_ ? 'Saved' : 'Save'}
          </button>
          <button type="button" className="av-btn av-btn--sm" aria-pressed={y} onClick={() => l(n.id)}>
            {y ? <ListChecks size={15} aria-hidden /> : <ListPlus size={15} aria-hidden />}{' '}
            {y ? 'In revision' : 'Add to revision'}
          </button>
          <button type="button" className="av-btn av-btn--sm" disabled={w} onClick={() => f(S.map((e) => e.id))}>
            <Zap size={15} aria-hidden /> {w ? 'Flashcards added' : `Add ${S.length} flashcards`}
          </button>
          {P ? (
            F ? (
              <button type="button" className="av-btn av-btn--sm" onClick={() => p.hideStructure(n.id)}>
                <EyeOff size={15} aria-hidden />
                {' Hide'}
              </button>
            ) : (
              <button type="button" className="av-btn av-btn--sm" onClick={() => p.showStructure(n.id)}>
                <Eye size={15} aria-hidden />
                {' Show'}
              </button>
            )
          ) : null}
          {P && (
            <>
              <button type="button" className="av-btn av-btn--sm" onClick={() => p.focusStructure(n.id)}>
                <Crosshair size={15} aria-hidden />
                {' Focus camera'}
              </button>
              <button
                type="button"
                className="av-btn av-btn--sm"
                aria-pressed={!!p.isolated?.includes(n.id)}
                onClick={() =>
                  p.isolated?.includes(n.id) ? p.isolate([]) : (p.isolate([n.id]), p.focusStructure(n.id))
                }
              >
                <Focus size={15} aria-hidden /> {p.isolated?.includes(n.id) ? 'Exit isolation' : 'Isolate'}
              </button>
            </>
          )}
        </div>
        {HEART_IDS.has(n.id) && p.modelId !== 'zanatomy-heart' && (
          <button
            type="button"
            className="av-btn"
            onClick={() => {
              let e = n.id;
              p.setModel('zanatomy-heart');
              setTimeout(() => p.focusStructure(e), 50);
            }}
          >
            <HeartPulse size={15} aria-hidden />
            {' Heart close-up (Z-Anatomy)'}
          </button>
        )}
        {p.modelId === 'zanatomy-heart' && (
          <button
            type="button"
            className="av-btn"
            onClick={() => {
              let e = n.id;
              p.setModel('schematic-body-v1');
              setTimeout(() => p.focusStructure(e), 50);
            }}
          >
            <Box size={15} aria-hidden />
            {' Back to the full-body model'}
          </button>
        )}
        {BRAIN_IDS.has(n.id) && p.modelId !== 'bodyparts3d-brain-skull' && (
          <button
            type="button"
            className="av-btn"
            onClick={() => {
              let e = n.id;
              switchModel('bodyparts3d-brain-skull', e);
            }}
          >
            <HeartPulse size={15} aria-hidden />
            {' Brain and skull close-up'}
          </button>
        )}
        {p.modelId === 'bodyparts3d-brain-skull' && (
          <button
            type="button"
            className="av-btn"
            onClick={() => {
              let e = n.id;
              switchModel('schematic-body-v1', e);
            }}
          >
            <Box size={15} aria-hidden />
            {' Back to the full-body model'}
          </button>
        )}
        {(LUNG_IDS.has(n.id) || n.parentId === 'alveoli' || n.parentId === 'bronchioles') &&
          p.modelId !== 'anatomyverse-alveoli' && (
            <button
              type="button"
              className="av-btn"
              onClick={() => {
                switchModel('anatomyverse-alveoli', 'alveoli');
              }}
            >
              <HeartPulse size={15} aria-hidden />
              {' Alveoli close-up: gas exchange'}
            </button>
          )}
        {p.modelId === 'anatomyverse-alveoli' && (
          <button
            type="button"
            className="av-btn"
            onClick={() => {
              switchModel('schematic-body-v1', 'right-lung');
            }}
          >
            <Box size={15} aria-hidden />
            {' Back to the full-body model'}
          </button>
        )}
        {(n.id === 'diaphragm' || n.parentId === 'diaphragm' || n.id === 'phrenic-nerve') && (
          <button type="button" className="av-btn" onClick={() => showDiaphragm()}>
            <HeartPulse size={15} aria-hidden />
            {' Show blood and nerve supply of the diaphragm'}
          </button>
        )}
        {(n.id === 'heart' || n.parentId === 'heart') && P && (
          <button
            type="button"
            className="av-btn av-btn--primary"
            onClick={() => {
              p.setHeartBeating(!p.heartBeating);
              if (!p.heartBeating) {
                p.focusStructure('heart');
              }
            }}
          >
            {p.heartBeating ? 'Stop heartbeat' : '▶ Watch the heart beat'}
          </button>
        )}
        <dl className="flex flex-col gap-3">
          <Field label="Description">{n.description}</Field>
          {n.location && <Field label="Location">{n.location}</Field>}
          {n.function && <Field label="Function">{n.function}</Field>}
          {n.origin && <Field label="Origin">{n.origin}</Field>}
          {n.insertion && <Field label="Insertion">{n.insertion}</Field>}
          {n.innervation && <Field label="Innervation">{n.innervation}</Field>}
          {n.actions && <Field label="Main actions">{n.actions}</Field>}
          {n.bloodSupply && <Field label="Blood supply">{n.bloodSupply}</Field>}
          {n.venousDrainage && <Field label="Venous drainage">{n.venousDrainage}</Field>}
          {n.landmarks?.length ? (
            <Field label="Major landmarks">
              <ul className="list-disc pl-5">
                {n.landmarks.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </Field>
          ) : null}
          {n.articulations?.length ? (
            <Field label="Articulations">
              <ul className="list-disc pl-5">
                {n.articulations.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </Field>
          ) : null}
          {n.clinicalRelevance && (
            <div className="rounded-xl border border-[var(--av-border)] bg-[var(--av-surface-2)] p-3">
              <dt className="av-section-title mb-1 flex items-center gap-1">
                <Stethoscope size={13} aria-hidden />
                {' Clinical relevance (educational)'}
              </dt>
              <dd className="text-sm leading-relaxed">{n.clinicalRelevance}</dd>
            </div>
          )}
        </dl>
        <TranslationsSection structureId={n.id} />
        {(n.parentId || L.length > 0) && (
          <section>
            <h3 className="av-section-title mb-2">Hierarchy</h3>
            <div className="flex flex-wrap gap-1.5">
              {n.parentId && (
                <>
                  <span className="text-xs text-[var(--av-text-faint)]">Part of</span>
                  <RelatedChip id={n.parentId} onPick={t} />
                </>
              )}
              {L.length > 0 && (
                <>
                  <span className="text-xs text-[var(--av-text-faint)]">Contains</span>
                  {L.map((e) => (
                    <RelatedChip key={e} id={e} onPick={t} />
                  ))}
                </>
              )}
            </div>
          </section>
        )}
        {O.length > 0 && (
          <section aria-labelledby="rel-title">
            <h3 id="rel-title" className="av-section-title mb-2">
              Relationships
            </h3>
            <ul className="flex flex-col gap-1.5">
              {O.map((e, r) => (
                <li key={r} className="text-sm leading-snug">
                  <span className="text-[var(--av-text-muted)]">
                    {n.name} {e.label}{' '}
                  </span>
                  <button
                    type="button"
                    className="font-medium text-[var(--av-teal)] underline-offset-2 hover:underline"
                    onClick={() => t(e.otherId)}
                  >
                    {getStructure(e.otherId)?.name ?? e.otherId}
                  </button>
                  {e.note && (
                    <span className="text-xs text-[var(--av-text-faint)]">
                      {' — '}
                      {e.note}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {n.learningObjectives?.length ? (
          <section>
            <h3 className="av-section-title mb-2">Learning objectives</h3>
            <ul className="list-disc pl-5 text-sm text-[var(--av-text-muted)]">
              {n.learningObjectives.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </section>
        ) : null}
        <section className="flex flex-wrap gap-2">
          {j.length > 0 && (
            <Link to={`/app/quiz?structure=${n.id}`} className="av-btn av-btn--sm">
              <GraduationCap size={15} aria-hidden /> {j.length}
              {' related question'}
              {j.length > 1 ? 's' : ''}
            </Link>
          )}
          {M.map((e) => (
            <Link key={e.id} to={`/app/clinical/${e.id}`} className="av-btn av-btn--sm">
              <Stethoscope size={15} aria-hidden /> {e.title}
            </Link>
          ))}
          {P && null}
        </section>
        <section>
          <h3 className="av-section-title mb-2">Sources</h3>
          <SourceList sources={n.sources} />
        </section>
      </article>
    );
  }
}
