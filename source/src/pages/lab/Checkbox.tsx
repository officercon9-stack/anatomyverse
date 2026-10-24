// @ts-nocheck
import { useAvFlags, avFlags } from './flags';

export function Checkbox({ k: _k, label: _lb, hint: _h, sub: _sb }) {
  let _g = useAvFlags();
  return (
    <label className={`flex items-start gap-2 text-sm ${_sb ? 'ml-6' : ''}`}>
      <input
        type="checkbox"
        className="av-checkbox mt-0.5"
        checked={!!_g[_k]}
        onChange={(_e) =>
          avFlags.set({
            [_k]: _e.target.checked,
          })
        }
      />
      <span>
        {_lb}
        {_h && <span className="block text-[11px] leading-snug text-[var(--av-text-faint)]">{_h}</span>}
      </span>
    </label>
  );
}
