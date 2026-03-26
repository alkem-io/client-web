import { useState } from 'react';
import { useResizeObserver } from '@/core/ui/hooks/useResizeObserver';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import CookieSettings from './CookieSettings';
import ConsentContainer from './components/ConsentContainer';
import GeneralConsent from './GeneralConsent';

const CookieConsent = ({ ref }) => {
  const [cookieOptionsOpen, setCookieOptionsOpen] = useState(false);

  const handleOpenSettings = () => setCookieOptionsOpen(true);

  const containerRef = useCombinedRefs(null, ref);

  useResizeObserver({
    targetRef: containerRef,
    onResize: () => {
      typeof ref === 'function' && ref(containerRef.current);
    },
  });

  return (
    <ConsentContainer ref={containerRef}>
      {!cookieOptionsOpen ? <GeneralConsent handleOpenSettings={handleOpenSettings} /> : <CookieSettings />}
    </ConsentContainer>
  );
};

export default CookieConsent;
