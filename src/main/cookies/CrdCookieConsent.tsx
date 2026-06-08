import type { Ref } from 'react';
import { useResizeObserver } from '@/core/ui/hooks/useResizeObserver';
import { CookieConsentBanner } from '@/crd/components/common/CookieConsentBanner';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import { AlkemioCookieTypes, useAlkemioCookies } from './useAlkemioCookies';

/**
 * Connector for the CRD cookie consent banner. Owns cookie persistence (and, through it,
 * the analysis/APM opt-in) and forwards a ref up so the app shell can measure the banner
 * height and pad the page content accordingly.
 */
const CrdCookieConsent = ({ ref }: { ref?: Ref<HTMLDivElement> }) => {
  const { acceptAllCookies, acceptOnlySelected } = useAlkemioCookies();
  const containerRef = useCombinedRefs<HTMLDivElement | null>(null, ref);

  useResizeObserver({
    targetRef: containerRef,
    onResize: () => {
      typeof ref === 'function' && ref(containerRef.current);
    },
  });

  const handleConfirm = (analysisAccepted: boolean) => {
    acceptOnlySelected(analysisAccepted ? [AlkemioCookieTypes.analysis] : []);
  };

  return <CookieConsentBanner ref={containerRef} onAcceptAll={acceptAllCookies} onConfirm={handleConfirm} />;
};

export default CrdCookieConsent;
