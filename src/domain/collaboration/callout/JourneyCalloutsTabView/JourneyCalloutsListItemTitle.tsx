import React from 'react';
import { useTranslation } from 'react-i18next';
import EllipsableWithCount from '@core/ui/typography/EllipsableWithCount';
import TranslationKey from '@core/i18n/utils/TranslationKey';

interface JourneyCalloutsListItemTitleProps {
  callout: {
    activity: number;
    framing: {
      profile: {
        displayName: string;
      };
    };
    flowStates?: string[];
  };
}

const SEPARATOR = ' — ';

const JourneyCalloutsListItemTitle = ({ callout }: JourneyCalloutsListItemTitleProps) => {
  const { t, i18n } = useTranslation();

  const [flowState] = callout.flowStates ?? [];

  return (
    <EllipsableWithCount count={callout.activity}>
      {callout.framing.profile.displayName}
      {SEPARATOR}
      {flowState && (
        <strong>
          {i18n.exists(`common.enums.innovationFlowState.${flowState}`)
            ? t(`common.enums.innovationFlowState.${flowState}` as TranslationKey)
            : flowState}
        </strong>
      )}
    </EllipsableWithCount>
  );
};

export default JourneyCalloutsListItemTitle;
