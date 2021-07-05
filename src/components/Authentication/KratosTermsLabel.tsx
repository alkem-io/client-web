/* eslint-disable jsx-a11y/anchor-has-content */
import React, { FC } from 'react';
import { Trans } from 'react-i18next';

interface KratosTermsLabelProps {
  termsURL: string;
  privacyURL: string;
}

const KratosTermsLabel: FC<KratosTermsLabelProps> = ({ termsURL, privacyURL }) => {
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
