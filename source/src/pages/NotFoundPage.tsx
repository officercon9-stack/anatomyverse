// @ts-nocheck
import { PageContainer } from '../components/PageLayout';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <PageContainer>
      <div className="av-card mx-auto mt-10 max-w-md p-6 text-center">
        <h1 className="mb-2 text-xl font-semibold">Page not found</h1>
        <p className="mb-4 text-sm text-[var(--av-text-muted)]">The page you requested does not exist.</p>
        <Link to="/app/dashboard" className="av-btn av-btn--primary">
          Go to dashboard
        </Link>
      </div>
    </PageContainer>
  );
}
