import { useCallback, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import CookieSettings from './CookieSettings';
import ConsentContainer from './components/ConsentContainer';
import GeneralConsent from './GeneralConsent';

const CookieConsent = ({ ref }) => {
  const [cookieOptionsOpen, setCookieOptionsOpen] = useState(false);

  const handleOpenSettings = useCallback(() => setCookieOptionsOpen(true), [setCookieOptionsOpen]);

  const containerRef = useCombinedRefs(null, ref);

  useResizeDetector({
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
