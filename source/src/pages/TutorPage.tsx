// @ts-nocheck
import { searchStructures } from '../lib/search';
import { relationsOf } from '../data/relationships';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useState } from 'react';
import { getStructure, structures } from '../data';
import { api } from '../lib/api';
import { QUESTIONS } from '../data/questions';
import { PageContainer, PageHeader } from '../components/PageLayout';
import { X, Bot, Info, LoaderCircle, Send } from 'lucide-react';
import { SearchBox } from '../components/SearchBox';

export var STOP_WORDS = new Set(
  'what.where.which.when.does.explain.describe.tell.about.with.from.into.that.this.the.and.for.are.its.nerve.nerves.artery.arteries.vein.veins.muscle.muscles.bone.bones.supply.supplies.blood.function.functions.origin.insertion.action.actions.relationship.relationships.clinical.relevance.located.location.simply.structure.left.right.main.major.part.parts.system.innervation.innervates'.split(
    '.',
  ),
);

export function scoreMatch(e, t, n, r = 3) {
  let i = Object.fromEntries(t.map((e) => [e.id, e]));
  let a = [];
  if (n && i[n]) {
    a.push(i[n]);
  }
  let o = e
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  let s = [];
  for (let e = 3; e >= 1; e--) {
    for (let t = 0; t + e <= o.length; t++) {
      let n = o.slice(t, t + e);
      if (
        (e !== 1 || (!(n[0].length < 4) && !STOP_WORDS.has(n[0]))) &&
        !n.every((e) => STOP_WORDS.has(e) || e.length < 3)
      ) {
        s.push(n.join(' '));
      }
    }
  }
  let c = new Map();
  for (let e of s) {
    for (let n of searchStructures(e, t, 5)) {
      let t = n.score + e.split(' ').length * 2;
      if (n.score >= 40 && t > (c.get(n.structure.id)?.score ?? 0)) {
        c.set(n.structure.id, {
          s: n.structure,
          score: t,
        });
      }
    }
  }
  for (let { s: e } of [...c.values()].sort((e, t) => t.score - e.score)) {
    if (!a.some((t) => t.id === e.id)) {
      a.push(e);
    }
  }
  return a.slice(0, r);
}

export function buildAnswer(e, t, n, r) {
  let i = scoreMatch(e, n, r);
  let a =
    'Offline tutor: answer assembled from AnatomyVerse structure records (pending expert review). No AI model was used.';
  if (!i.length) {
    return {
      mode: 'offline',
      groundedOn: [],
      notice: a,
      answer:
        'I could not find a structure in the AnatomyVerse records that matches your question. Try naming a structure (for example “femur” or “left ventricle”), or select one in the 3D laboratory first.',
    };
  }
  let o = e.toLowerCase();
  let c = [];
  for (let e of i.slice(0, t === 'beginner' ? 1 : 2)) {
    let r = [`**${e.name}**${e.latinName && t !== 'beginner' ? ` (${e.latinName})` : ''}`];
    let i = (e) => o.includes(e);
    let a = [];
    if ((i('nerve') || i('innervat') || i('supply')) && e.innervation) {
      a.push(`Nerve supply: ${e.innervation}`);
    }
    if ((i('blood') || i('artery') || i('supply')) && e.bloodSupply) {
      a.push(`Blood supply: ${e.bloodSupply}`);
    }
    if ((i('origin') || i('attach') || i('arise')) && e.origin) {
      a.push(`Origin: ${e.origin}`);
    }
    if ((i('insert') || i('attach')) && e.insertion) {
      a.push(`Insertion: ${e.insertion}`);
    }
    if ((i('action') || i('do') || i('move')) && e.actions) {
      a.push(`Actions: ${e.actions}`);
    }
    if ((i('where') || i('locat') || i('position')) && e.location) {
      a.push(`Location: ${e.location}`);
    }
    if ((i('clinic') || i('injur') || i('fractur')) && e.clinicalRelevance) {
      a.push(`Clinical relevance: ${e.clinicalRelevance}`);
    }
    if (i('relat') || i('near') || i('next to')) {
      let t = relationsOf(e.id)
        .slice(0, 5)
        .map(
          (t) =>
            `${e.name} ${t.label} ${n.find((e) => e.id === t.otherId)?.name ?? t.otherId}${t.note ? ` (${t.note})` : ''}`,
        );
      if (t.length) {
        a.push(`Relationships:\n- ${t.join('\n- ')}`);
      }
    }
    if (a.length) {
      r.push(...a);
    } else if (t === 'beginner') {
      r.push(e.description);
      if (e.function) {
        r.push(`In short: ${e.function}`);
      }
    } else {
      r.push(e.description);
      if (e.location) {
        r.push(`Location: ${e.location}`);
      }
      if (e.function) {
        r.push(`Function: ${e.function}`);
      }
      if (e.origin) {
        r.push(`Origin: ${e.origin}`);
      }
      if (e.insertion) {
        r.push(`Insertion: ${e.insertion}`);
      }
      if (e.innervation) {
        r.push(`Nerve supply: ${e.innervation}`);
      }
      if (e.actions) {
        r.push(`Actions: ${e.actions}`);
      }
      if (t === 'advanced' && e.clinicalRelevance) {
        r.push(`Clinical relevance: ${e.clinicalRelevance}`);
      }
    }
    c.push(r.join('\n'));
  }
  if (t === 'advanced' && i[0]) {
    c.push(
      `Revision prompt: explain how the ${i[0].name.toLowerCase()} relates to two neighbouring structures, then check your answer in the Relationship Explorer.`,
    );
  }
  return {
    mode: 'offline',
    answer: c.join('\n\n'),
    groundedOn: i.map((e) => e.id),
    notice: a,
  };
}

export var SUGGESTED_QUESTIONS = [
  {
    id: 'beginner',
    label: 'Beginner',
  },
  {
    id: 'medical-student',
    label: 'Medical student',
  },
  {
    id: 'advanced',
    label: 'Advanced revision',
  },
];

export function AnswerText({ text: e }) {
  return (
    <div className="flex flex-col gap-2 text-sm leading-relaxed">
      {e.split(/\n{2,}/).map((e, t) => (
        <p key={t} className="whitespace-pre-line">
          {e
            .split(/(\*\*[^*]+\*\*)/g)
            .map((e, t) =>
              e.startsWith('**') && e.endsWith('**') ? (
                <strong key={t}>{e.slice(2, -2)}</strong>
              ) : (
                <span key={t}>{e}</span>
              ),
            )}
        </p>
      ))}
    </div>
  );
}

export function TutorPage() {
  let [e] = useSearchParams();
  let t = useAuthStore((e) => e.user);
  let [n, a] = useState(e.get('structure'));
  let [s, m] = useState(t?.preferences.level ?? 'medical-student');
  let [y, x] = useState('');
  let [w, T] = useState([]);
  let [A, j] = useState(false);
  let M = getStructure(n);
  let N = async (e) => {
    if (!e.trim()) {
      return;
    }
    j(true);
    let t;
    try {
      t = await api('/tutor', {
        method: 'POST',
        json: {
          question: e,
          level: s,
          structureId: n ?? undefined,
        },
      });
    } catch {
      t = buildAnswer(e, s, structures, n ?? undefined);
    }
    T((n) => [
      ...n,
      {
        q: e,
        a: t,
      },
    ]);
    x('');
    j(false);
  };
  let P = M
    ? [
        `Explain the ${M.name.toLowerCase()} simply`,
        `What are the relationships of the ${M.name.toLowerCase()}?`,
        `What is the clinical relevance of the ${M.name.toLowerCase()}?`,
        ...(M.innervation ? [`What is the nerve supply of ${M.name}?`] : []),
      ]
    : ['What does the diaphragm do?', 'Where is the femur?', 'What is the nerve supply of biceps brachii?'];
  let F = M ? QUESTIONS.filter((e) => e.relatedStructureIds.includes(M.id)).length : 0;
  return (
    <PageContainer>
      <PageHeader kicker="Study support" title="Anatomy tutor">
        Answers are grounded in AnatomyVerse structure records. If the operator has configured an AI model on the server
        it adds explanation in your chosen level; otherwise a built-in offline tutor assembles answers from the records.
      </PageHeader>
      <div className="mb-4 grid gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <span className="av-label-text">Context structure</span>
          {M ? (
            <div className="flex items-center gap-2">
              <span className="av-badge av-badge--accent py-1.5 text-sm">{M.name}</span>
              <button
                type="button"
                className="av-btn av-btn--ghost av-btn--sm"
                onClick={() => a(null)}
                aria-label="Clear context structure"
              >
                <X size={14} aria-hidden />
              </button>
              <Link to={`/app/lab?structure=${M.id}`} className="text-xs text-[var(--av-teal)] hover:underline">
                View in lab
              </Link>
            </div>
          ) : (
            <SearchBox onSelect={a} placeholder="Optional: choose a structure to discuss" />
          )}
        </div>
        <fieldset>
          <legend className="av-label-text">Explanation level</legend>
          <div className="flex gap-1 rounded-xl border border-[var(--av-border)] p-1">
            {SUGGESTED_QUESTIONS.map((e) => (
              <button
                key={e.id}
                type="button"
                aria-pressed={s === e.id}
                onClick={() => m(e.id)}
                className={`rounded-lg px-3 py-1.5 text-sm ${s === e.id ? 'bg-[var(--av-surface-2)] text-[var(--av-text)]' : 'text-[var(--av-text-muted)]'}`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <section className="flex flex-col gap-4" aria-live="polite" aria-label="Conversation">
        {w.map((e, t) => (
          <div key={t} className="flex flex-col gap-2">
            <p className="self-end rounded-2xl rounded-br-md bg-[var(--av-surface-2)] px-4 py-2 text-sm">{e.q}</p>
            <div className="av-card p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Bot size={16} className="text-[var(--av-teal)]" aria-hidden />
                <span className={`av-badge ${e.a.mode === 'ai' ? 'av-badge--accent' : ''}`}>
                  {e.a.mode === 'ai' ? 'AI explanation · grounded' : 'Offline tutor'}
                </span>
                {e.a.groundedOn.map((e) => (
                  <Link key={e} to={`/app/lab?structure=${e}`} className="av-badge hover:text-[var(--av-teal)]">
                    {getStructure(e)?.name ?? e}
                  </Link>
                ))}
              </div>
              <AnswerText text={e.a.answer} />
              <p className="mt-3 flex items-start gap-1.5 text-xs text-[var(--av-text-faint)]">
                <Info size={12} className="mt-0.5 shrink-0" aria-hidden />
                {e.a.notice}
              </p>
            </div>
          </div>
        ))}
        {w.length === 0 && (
          <div className="av-card p-4 text-sm text-[var(--av-text-muted)]">
            <p className="mb-2">Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {P.map((e) => (
                <button key={e} type="button" className="av-btn av-btn--sm" onClick={() => N(e)}>
                  {e}
                </button>
              ))}
            </div>
            {M && F > 0 && (
              <p className="mt-3">
                {'Want practice questions? '}
                <Link className="text-[var(--av-teal)] underline" to={`/app/quiz?structure=${M.id}`}>
                  {F}
                  {' question(s) about the '}
                  {M.name.toLowerCase()}
                </Link>
                .
              </p>
            )}
          </div>
        )}
      </section>
      <form
        className="sticky bottom-0 mt-4 flex gap-2 bg-[var(--av-bg)] py-3"
        onSubmit={(e) => {
          e.preventDefault();
          N(y);
        }}
      >
        <label htmlFor="tutor-q" className="sr-only">
          Your question
        </label>
        <input
          id="tutor-q"
          className="av-input"
          placeholder={M ? `Ask about the ${M.name.toLowerCase()}…` : 'Ask an anatomy question…'}
          value={y}
          maxLength={500}
          onChange={(e) => x(e.target.value)}
        />
        <button type="submit" className="av-btn av-btn--primary" disabled={A || !y.trim()} aria-label="Send question">
          {A ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : <Send size={16} aria-hidden />}
        </button>
      </form>
      <p className="text-xs text-[var(--av-text-faint)]">
        The tutor supports learning only. It can be wrong; check important facts in the cited sources. Do not enter
        patient information.
      </p>
    </PageContainer>
  );
}
