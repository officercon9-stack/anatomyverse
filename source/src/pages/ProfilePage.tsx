// @ts-nocheck
import { useAuthStore } from '../store/auth';
import { useState } from 'react';
import { ServerOff, Download, Trash, LogOut } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useProgressStore, progressSnapshot } from '../store/progress';
import { PageContainer, PageHeader } from '../components/PageLayout';

export function AuthForm() {
  let { login: e, register: t, backend: n } = useAuthStore();
  let [r, i] = useState('login');
  let [a, o] = useState('');
  let [s, c] = useState('');
  let [l, u] = useState('');
  let [d, f] = useState(null);
  let [p, m] = useState(null);
  let [h, g] = useState(false);
  if (n === 'offline') {
    return (
      <div className="av-card flex gap-3 p-5 text-sm">
        <ServerOff size={20} className="shrink-0 text-[var(--av-warn)]" aria-hidden />
        <div>
          <p className="font-medium">Saved on this device</p>
          <p className="mt-1 text-[var(--av-text-muted)]">
            Your progress is stored in this browser. Use the buttons below to export or clear it.
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="av-card max-w-md p-5">
        <div
          role="tablist"
          aria-label="Account"
          className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-[var(--av-border)] p-1"
        >
          {['login', 'register'].map((e) => (
            <button
              key={e}
              role="tab"
              type="button"
              aria-selected={r === e}
              onClick={() => {
                i(e);
                f(null);
              }}
              className={`rounded-lg py-1.5 text-sm ${r === e ? 'bg-[var(--av-surface-2)] text-[var(--av-text)]' : 'text-[var(--av-text-muted)]'}`}
            >
              {e === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>
        <form
          className="flex flex-col gap-3"
          onSubmit={async (n) => {
            n.preventDefault();
            f(null);
            m(null);
            g(true);
            try {
              if (r === 'login') {
                await e(a, s);
              } else if (r === 'register') {
                await t(a, s, l);
              } else {
                await api('/auth/password-reset/request', {
                  method: 'POST',
                  json: {
                    email: a,
                  },
                });
                m(
                  'If an account exists for that email, reset instructions have been sent. (Email delivery must be configured by the operator — see DEPLOYMENT.md.)',
                );
              }
            } catch (e) {
              f(e instanceof ApiError ? e.message : 'Could not reach the server.');
            } finally {
              g(false);
            }
          }}
          noValidate
        >
          {r === 'register' && (
            <div>
              <label htmlFor="name" className="av-label-text">
                Display name
              </label>
              <input
                id="name"
                className="av-input"
                value={l}
                onChange={(e) => u(e.target.value)}
                autoComplete="nickname"
                required
                maxLength={60}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="av-label-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="av-input"
              value={a}
              onChange={(e) => o(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          {r !== 'reset' && (
            <div>
              <label htmlFor="password" className="av-label-text">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="av-input"
                value={s}
                onChange={(e) => c(e.target.value)}
                autoComplete={r === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={10}
                aria-describedby={r === 'register' ? 'pw-help' : undefined}
              />
              {r === 'register' && (
                <p id="pw-help" className="mt-1 text-xs text-[var(--av-text-faint)]">
                  At least 10 characters.
                </p>
              )}
            </div>
          )}
          {d && (
            <p className="text-sm text-[var(--av-danger)]" role="alert">
              {d}
            </p>
          )}
          {p && (
            <p className="text-sm text-[var(--av-ok)]" role="status">
              {p}
            </p>
          )}
          <button type="submit" className="av-btn av-btn--primary" disabled={h}>
            {r === 'login' ? 'Sign in' : r === 'register' ? 'Create account' : 'Send reset link'}
          </button>
          <button
            type="button"
            className="text-left text-xs text-[var(--av-text-muted)] underline"
            onClick={() => i(r === 'reset' ? 'login' : 'reset')}
          >
            {r === 'reset' ? 'Back to sign in' : 'Forgot password?'}
          </button>
        </form>
        <p className="mt-4 text-xs text-[var(--av-text-faint)]">
          When you sign in, progress saved in this browser is merged into your account.
        </p>
      </div>
    );
  }
}

export function LocalDataSection() {
  let e = useProgressStore();
  return (
    <section className="av-card p-5" aria-labelledby="local-title">
      <h2 id="local-title" className="mb-1 font-semibold">
        Progress stored on this device
      </h2>
      <p className="mb-3 text-sm text-[var(--av-text-muted)]">
        {e.bookmarks.length}
        {' saved structures · '}
        {Object.keys(e.flashcards).length}
        {' flashcards · '}
        {e.quizAttempts.length}
        {' quiz attempts · '}
        {Object.keys(e.lessons).length}
        {' lessons started'}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="av-btn av-btn--sm"
          onClick={() => {
            let t = new Blob([JSON.stringify(progressSnapshot(e), null, 2)], {
              type: 'application/json',
            });
            let n = document.createElement('a');
            n.href = URL.createObjectURL(t);
            n.download = 'anatomyverse-progress.json';
            n.click();
            URL.revokeObjectURL(n.href);
          }}
        >
          <Download size={14} aria-hidden />
          {' Export as JSON'}
        </button>
        <button
          type="button"
          className="av-btn av-btn--sm"
          onClick={() => {
            if (window.confirm('Delete all progress stored in this browser? This cannot be undone.')) {
              e.clearLocal();
            }
          }}
        >
          <Trash size={14} aria-hidden />
          {' Clear local progress'}
        </button>
      </div>
    </section>
  );
}

export function ProfilePage() {
  let { user: e, logout: t, updatePreferences: n } = useAuthStore();
  let [r, i] = useState(false);
  return (
    <PageContainer>
      <PageHeader kicker="Account" title={e ? 'Your profile' : 'My progress'}>
        {!e && 'Your saved structures, flashcards and quiz results are kept in this browser.'}
      </PageHeader>
      <div className="flex flex-col gap-4">
        {e ? (
          <section className="av-card max-w-xl p-5">
            <dl className="mb-4 grid grid-cols-[8rem_1fr] gap-2 text-sm">
              <dt className="text-[var(--av-text-faint)]">Name</dt>
              <dd>{e.displayName}</dd>
              <dt className="text-[var(--av-text-faint)]">Email</dt>
              <dd>{e.email}</dd>
              <dt className="text-[var(--av-text-faint)]">Role</dt>
              <dd>{e.role}</dd>
            </dl>
            <label htmlFor="pref-level" className="av-label-text">
              Preferred explanation level
            </label>
            <select
              id="pref-level"
              className="av-input mb-3 max-w-xs"
              value={e.preferences.level ?? 'medical-student'}
              onChange={async (e) => {
                await n({
                  level: e.target.value,
                });
                i(true);
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="medical-student">Medical student</option>
              <option value="advanced">Advanced revision</option>
            </select>
            {r && (
              <p className="mb-3 text-xs text-[var(--av-ok)]" role="status">
                Preferences saved.
              </p>
            )}
            <button type="button" className="av-btn" onClick={t}>
              <LogOut size={15} aria-hidden />
              {' Sign out'}
            </button>
          </section>
        ) : (
          <AuthForm />
        )}
        <LocalDataSection />
      </div>
    </PageContainer>
  );
}
