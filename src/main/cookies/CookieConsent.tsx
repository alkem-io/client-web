import React, { forwardRef, useCallback, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import ConsentContainer from './components/ConsentContainer';
import GeneralConsent from './GeneralConsent';
import CookieSettings from './CookieSettings';
import { useCombinedRefs } from '@domain/shared/utils/useCombinedRefs';

const CookieConsent = forwardRef<HTMLDivElement>((_, ref) => {
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
});

export default CookieConsent;
