/* eslint-disable jsx-a11y/anchor-has-content */
import React, { FC, useContext } from 'react';
import { Trans } from 'react-i18next';
import { KratosUIContext } from '../KratosUI';

interface KratosTermsLabelProps {}

const KratosTermsLabel: FC<KratosTermsLabelProps> = () => {
  const { termsURL, privacyURL } = useContext(KratosUIContext);

  return (
    <Trans
      i18nKey={'pages.registration.terms'}
      components={{
        terms: <a href={termsURL} />,
        privacy: <a href={privacyURL} />,
      }}
    />
  );
};

export default KratosTermsLabel;
