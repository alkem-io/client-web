import React, { ReactElement } from 'react';
import { Trans } from 'react-i18next';
import TranslationKey from '../../../../types/TranslationKey';

interface ActivityDescriptionProps {
  i18nKey: TranslationKey;
  values?: Record<string, string | undefined>;
  components?: Record<string, ReactElement>;
  withLinkToParent?: boolean;
}

const ActivityDescription = ({ i18nKey, values, components, withLinkToParent }: ActivityDescriptionProps) => {
  return (
    <>
      <Trans
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18nKey={i18nKey as any}
        values={values}
        components={components}
      />
      {withLinkToParent && (
        <Trans i18nKey="components.activity-log-view.parent-link" values={values} components={components} />
      )}
    </>
  );
};

export default ActivityDescription;
