import React, { FC, useCallback, useState } from 'react';
import ConsentContainer from './components/ConsentContainer';
import GeneralConsent from './GeneralConsent';
import CookieSettings from './CookieSettings';

const CookieConsent: FC = () => {
  const [cookieOptionsOpen, setCookieOptionsOpen] = useState(false);

  const handleOpenSettings = useCallback(() => setCookieOptionsOpen(true), [setCookieOptionsOpen]);

  return (
    <ConsentContainer>
      {!cookieOptionsOpen ? <GeneralConsent handleOpenSettings={handleOpenSettings} /> : <CookieSettings />}
    </ConsentContainer>
  );
};

export default CookieConsent;
