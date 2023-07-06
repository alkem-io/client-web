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

/**
 * Provides needed interpolation values for an activity log item string. The string should be in format:
 * "{{date}} {{user}} invited you to <journeyicon /> {{journey}}", where "invited you to" is a sample text
 * to be customized in the provided string.
 * @param i18nKey
 * @param userDisplayName
 * @param journeyDisplayName
 * @param journeyTypeName
 * @constructor
 */
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
