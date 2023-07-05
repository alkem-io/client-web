import React from 'react';
import { Trans } from 'react-i18next';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import TranslationKey from '../../../../types/TranslationKey';
import journeyIcon from '../JourneyIcon/JourneyIcon';

interface ActivityDescriptionProps {
  // TODO add time
  i18nKey: TranslationKey;
  userDisplayName: string;
  journeyDisplayName: string;
  journeyTypeName: JourneyTypeName;
}

const ActivityDescription = ({
  i18nKey,
  userDisplayName,
  journeyDisplayName,
  journeyTypeName,
}: ActivityDescriptionProps) => {
  const JourneyIcon = journeyIcon[journeyTypeName];

  return (
    <Trans
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      i18nKey={i18nKey as any}
      values={{
        user: userDisplayName,
        journey: journeyDisplayName,
      }}
      components={{
        journeyicon: <JourneyIcon fontSize="inherit" />,
      }}
    />
  );
};

export default ActivityDescription;
