import React, { ReactNode } from 'react';
import { Trans } from 'react-i18next';
import TranslationKey from '../../../../types/TranslationKey';

interface ActivityDescriptionProps {
  i18nKey: TranslationKey;
  values: Record<string, string>;
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

/*
  /* journeyTypeName: JourneyTypeName | undefined;
  journeyDisplayName: string | undefined;
*/
/*time: string;
  userDisplayName: string;
  userUrl?: string;
  journeyUrl: string | undefined;
  calloutDisplayName?: string;
  postDisplayName?: string;

  const JourneyIcon = journeyTypeName && journeyIcon[journeyTypeName];

    if (!components) {
    components = {};
  }
  if (JourneyIcon) {
    components['journeyIcon'] = <JourneyIcon fontSize="inherit" sx={{ verticalAlign: 'bottom' }} />;
  }
  components['ParentLink'] = journeyUrl ? <Link href={journeyUrl} /> : <span />;
  components['UserLink'] = userUrl ? <Link href={userUrl} /> : <span />;

        user: userDisplayName,
        journeyType: journeyTypeName ? t(`common.${journeyTypeName}` as const) : undefined,
        journeyDisplayName,
        calloutDisplayName,
        postDisplayName,
      }}
*/
