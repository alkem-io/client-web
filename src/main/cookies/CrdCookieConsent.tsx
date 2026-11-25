import { type Ref, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResizeObserver } from '@/core/ui/hooks/useResizeObserver';
import { CookieConsentBanner } from '@/crd/components/common/CookieConsentBanner';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import { useCookieSettings } from './CookieSettingsProvider';

/**
 * Connector for the CRD cookie consent banner. Stores the choice through the shared cookie
 * settings (which toast on success), opens the shared sheet for Settings, and forwards a ref
 * up so the app shell can measure the banner height and pad the page content accordingly.
 * The banner unmounts once the consent cookie exists.
 */
const CrdCookieConsent = ({ ref }: { ref?: Ref<HTMLElement> }) => {
  const { t } = useTranslation('crd-layout');
  const { openCookieSettings, saveCookieSettings } = useCookieSettings();
  const [error, setError] = useState<string>();
  const containerRef = useCombinedRefs<HTMLElement | null>(null, ref);

  useResizeObserver({
    targetRef: containerRef,
    onResize: () => {
      typeof ref === 'function' && ref(containerRef.current);
    },
  });

  const choose = (analysis: boolean) => {
    setError(saveCookieSettings(analysis) ? undefined : t('cookieConsent.saveFailed'));
  };

  return (
    <CookieConsentBanner
      ref={containerRef}
      onAcceptAll={() => choose(true)}
      onOnlyNecessary={() => choose(false)}
      onOpenSettings={openCookieSettings}
      error={error}
    />
  );
};

export default CrdCookieConsent;
