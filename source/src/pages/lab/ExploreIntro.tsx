// @ts-nocheck
import { useState } from 'react';
import { SYSTEMS } from '../../data/systems';
import { CSF_SYSTEM, SPINAL_CORD_SYSTEM, MENINGES_SYSTEM } from './regions';
import { MousePointerClick, Target, GraduationCap } from 'lucide-react';
import { structureById } from '../../data';
import { SequencePlayer } from '../../components/SequencePlayer';
import { Link } from 'react-router-dom';

export function ExploreIntro({ onPick: e }) {
  let [_sh, _ssh] = useState(false);
  let [t, n] = useState('cardiovascular');
  let r = [...SYSTEMS, CSF_SYSTEM, SPINAL_CORD_SYSTEM, MENINGES_SYSTEM].find((e) => e.id === t);
  let i = [...SYSTEMS.filter((e) => e.sequence), CSF_SYSTEM, SPINAL_CORD_SYSTEM, MENINGES_SYSTEM];
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <p className="av-kicker mb-1">Explore mode</p>
        <h2 className="text-lg font-semibold">Click a part of the body</h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--av-text-muted)]">
          Click any part of the body. Its function and the diseases that affect it appear here.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {['heart', 'femur', 'diaphragm', 'cerebellum', 'kidney', 'biceps-brachii'].map((t) => (
          <button key={t} type="button" className="av-btn av-btn--sm justify-start" onClick={() => e(t)}>
            <MousePointerClick size={14} aria-hidden /> {structureById[t].name}
          </button>
        ))}
      </div>
      <button type="button" className="av-btn av-btn--sm self-start" onClick={() => _ssh(!_sh)}>
        {_sh ? 'Hide extras' : 'More: animations and practice'}
      </button>
      {_sh && (
        <div>
          <label htmlFor="seq-select" className="av-section-title mb-2 block">
            Pathway sequences
          </label>
          <select id="seq-select" className="av-input mb-3" value={t} onChange={(e) => n(e.target.value)}>
            {i.map((e) => (
              <option key={e.id} value={e.id}>
                {e.sequence.title}
              </option>
            ))}
          </select>
          <SequencePlayer key={r.id} system={r} />
        </div>
      )}
      {_sh && (
        <div className="av-card p-3 text-sm">
          <p className="mb-2 font-medium">Practise with the model</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/app/quiz?mode=identification" className="av-btn av-btn--sm">
              <Target size={14} aria-hidden />
              {' Identification practice'}
            </Link>
            <Link to="/app/quiz?mode=exam" className="av-btn av-btn--sm">
              <GraduationCap size={14} aria-hidden />
              {' Examination mode'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
