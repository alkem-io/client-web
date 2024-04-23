import React from 'react';
import { useTranslation } from 'react-i18next';
import { TypedCallout } from '../useCallouts/useCallouts';
import EllipsableWithCount from '../../../../core/ui/typography/EllipsableWithCount';
import TranslationKey from '../../../../core/i18n/utils/TranslationKey';

interface JourneyCalloutsListItemTitleProps {
  callout: TypedCallout;
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
