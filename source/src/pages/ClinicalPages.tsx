// @ts-nocheck
import { TriangleAlert, Stethoscope } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/PageLayout';
import { CLINICAL_CASES, clinicalCaseById } from '../data/clinicalCases';
import { Link, useParams } from 'react-router-dom';
import { ReviewBadge } from '../components/ReviewBadge';
import { getStructure } from '../data';
import { questionById } from '../data/questions';
import { QuestionView } from '../components/QuestionView';
import { SourceList } from '../components/SourceList';

export function ClinicalDisclaimer() {
  return (
    <p className="av-card mb-6 flex gap-2 p-4 text-sm text-[var(--av-text-muted)]">
      <TriangleAlert size={18} className="shrink-0 text-[var(--av-warn)]" aria-hidden />
      These are illustrative educational examples to connect anatomy with clinical reasoning. They are not real
      patients, not diagnostic guidance and not treatment advice.
    </p>
  );
}

export function ClinicalListPage() {
  return (
    <PageContainer>
      <PageHeader kicker="Clinical correlation" title="Clinical anatomy cases" />
      <ClinicalDisclaimer />
      <ul className="grid gap-4 sm:grid-cols-2">
        {CLINICAL_CASES.map((e) => (
          <li key={e.id}>
            <Link
              to={`/app/clinical/${e.id}`}
              className="av-card flex h-full flex-col gap-2 p-5 hover:border-[var(--av-teal)]"
            >
              <Stethoscope size={18} className="text-[var(--av-teal)]" aria-hidden />
              <h2 className="font-semibold">{e.title}</h2>
              <p className="text-sm text-[var(--av-text-muted)]">{e.objective}</p>
              <div className="mt-auto pt-2">
                <ReviewBadge status={e.reviewStatus} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}

export function ClinicalCasePage() {
  let { caseId: e } = useParams();
  let t = clinicalCaseById[e ?? ''];
  if (t) {
    return (
      <PageContainer>
        <PageHeader kicker="Educational example" title={t.title}>
          <ReviewBadge status={t.reviewStatus} />
        </PageHeader>
        <ClinicalDisclaimer />
        <div className="flex flex-col gap-5">
          <section className="av-card p-5">
            <h2 className="av-section-title mb-1">Learning objective</h2>
            <p className="text-sm">{t.objective}</p>
          </section>
          <section className="av-card p-5">
            <h2 className="av-section-title mb-1">Scenario</h2>
            <p className="text-sm leading-relaxed">{t.scenario}</p>
          </section>
          <section className="av-card p-5">
            <h2 className="av-section-title mb-2">Relevant anatomy</h2>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {t.relevantStructureIds.map((e) => (
                <Link
                  key={e}
                  to={`/app/lab?structure=${e}`}
                  className="av-badge hover:border-[var(--av-teal)] hover:text-[var(--av-teal)]"
                >
                  {getStructure(e)?.name ?? e}
                </Link>
              ))}
            </div>
            <h2 className="av-section-title mb-1">Anatomical explanation</h2>
            <p className="text-sm leading-relaxed">{t.explanation}</p>
          </section>
          <section>
            <h2 className="av-section-title mb-2">Revision questions</h2>
            <div className="flex flex-col gap-4">
              {t.questionIds.map(
                (e) => questionById[e] && <QuestionView key={e} question={questionById[e]} mode="practice" />,
              )}
            </div>
          </section>
          <section className="av-card p-5">
            <h2 className="av-section-title mb-2">Sources for further study</h2>
            <SourceList sources={t.sources} />
            <p className="mt-2 text-xs text-[var(--av-text-faint)]">
              The cited chapters cover the underlying anatomy. Clinical correlations are pending review by a qualified
              clinician-anatomist.
            </p>
          </section>
        </div>
      </PageContainer>
    );
  } else {
    return (
      <PageContainer>
        <p>
          {'Case not found. '}
          <Link to="/app/clinical" className="underline">
            Back to cases
          </Link>
        </p>
      </PageContainer>
    );
  }
}
