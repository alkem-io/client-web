import { Trans, useTranslation } from 'react-i18next';
import { useConfig } from '@/domain/platform/config/useConfig';

export function LinkTermsHelper() {
  const { t } = useTranslation('crd-space');
  const { locations } = useConfig();
  const termsUrl = locations?.terms;

  if (!termsUrl) return null;

  return (
    <Trans
      i18nKey="callout.linkTermsHelper"
      t={t}
      components={{
        terms: (
          // biome-ignore lint/a11y/useAnchorContent: content is injected by <Trans /> at runtime
          <a
            href={termsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary hover:text-primary/80"
          />
        ),
      }}
    />
  );
}
