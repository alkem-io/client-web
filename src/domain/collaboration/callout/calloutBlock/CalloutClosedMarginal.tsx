import React, { useMemo } from 'react';
import { CalloutState } from '../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import CalloutBlockMarginal from './CalloutBlockMarginal';

interface CalloutNotOpenStateMarginalProps {
  callout: {
    contributionPolicy: {
      state: CalloutState;
    };
    comments?: {
      messages?: unknown[];
    };
  };
  disabled?: boolean;
}

const CalloutClosedMarginal = ({ callout, disabled = false }: CalloutNotOpenStateMarginalProps) => {
  const { t } = useTranslation();

  const isClosed = useMemo(() => {
    const state = callout.contributionPolicy.state;

    if (!state || state === CalloutState.Open || disabled) {
      return false;
    }

    return !!callout.comments?.messages?.length;
  }, [callout.contributionPolicy.state, callout.comments?.messages, t]);

  if (!isClosed) {
    return null;
  }

  return <CalloutBlockMarginal variant="footer">{t('callout.closed')}</CalloutBlockMarginal>;
};

export default CalloutClosedMarginal;
