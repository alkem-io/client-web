import React, { ReactNode } from 'react';
import { Trans } from 'react-i18next';
import TranslationKey from '../../../../types/TranslationKey';

interface ActivityDescriptionProps {
  i18nKey: TranslationKey;
  values?: Record<string, string | undefined>;
  components?: Record<string, ReactNode>;
}

const ActivityDescription = ({ i18nKey, values, components }: ActivityDescriptionProps) => {
  return (
    <Trans
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      i18nKey={i18nKey as any}
      values={values}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      components={components as any}
    />
  );
};

export default ActivityDescription;
