import { CrdGenericErrorContent } from '@/main/crdPages/error/CrdGenericErrorContent';

type CrdTopLevelErrorPageProps = {
  error: Error;
  numericCode?: number;
};

/**
 * Bare CRD generic-error page for the top-level Sentry boundary, which renders
 * ABOVE the router / Apollo / auth providers. It therefore cannot use
 * `CrdLayoutWrapper`, `useNavigate`, or any router/Apollo hook — it wraps the
 * shared presentational body in its own `.crd-root` (so Tailwind preflight +
 * tokens apply) and offers reload only. Selected by `SentryErrorBoundaryProvider`
 * when CRD is enabled; legacy users get the MUI `ErrorPage` instead.
 */
export function CrdTopLevelErrorPage({ error, numericCode }: CrdTopLevelErrorPageProps) {
  return (
    <div className="crd-root flex min-h-screen items-center justify-center bg-background text-foreground">
      <CrdGenericErrorContent error={error} numericCode={numericCode} />
    </div>
  );
}
