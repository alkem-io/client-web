import { Trans, useTranslation } from 'react-i18next';

import { generateSupportMailtoUrl } from '@/core/ui/notifications/generateSupportMailtoUrl';
import { CrdErrorPage } from '@/crd/components/error/CrdErrorPage';
import { privateGraphQLEndpoint } from '@/main/constants/endpoints';

type CrdGenericErrorContentProps = {
  error: Error;
  numericCode?: number;
};

/**
 * Shared body for the CRD generic-error surfaces: the in-router boundary branch
 * (`CrdGenericErrorBranch`) and the top-level Sentry fallback
 * (`CrdTopLevelErrorPage`). Composes the localized copy and renders the
 * presentational `CrdErrorPage`. The caller supplies the surrounding chrome
 * (`CrdLayoutWrapper` or a bare `.crd-root`). No layout/router/Apollo here so it
 * is safe to render above the router.
 */
export function CrdGenericErrorContent({ error, numericCode }: CrdGenericErrorContentProps) {
  const { t } = useTranslation('crd-error');
  const { t: tDefault } = useTranslation();
  const mailtoUrl = generateSupportMailtoUrl({ numericCode, t: tDefault });

  return (
    <CrdErrorPage
      title={t('genericError.title')}
      description={
        <div className="space-y-2">
          <p>
            <Trans
              t={t}
              i18nKey="genericError.description"
              values={{ message: error.message }}
              components={{ italic: <i /> }}
            />
          </p>
          <p>{t('genericError.serverHint', { graphQLEndpoint: privateGraphQLEndpoint })}</p>
        </div>
      }
      code={numericCode !== undefined ? t('genericError.code', { code: numericCode }) : undefined}
      contactSlot={
        <Trans
          t={t}
          i18nKey="genericError.contactSupport"
          components={{
            contact: (
              // biome-ignore lint/a11y/useAnchorContent: content is injected by Trans
              <a
                href={mailtoUrl}
                className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            ),
          }}
        />
      }
      details={import.meta.env.MODE === 'development' ? error.stack : undefined}
      reloadLabel={t('genericError.actions.reload')}
      onReload={() => window.location.reload()}
    />
  );
}
