import React, { useMemo } from 'react';
import { CalloutState, CalloutType } from '@/core/apollo/generated/graphql-schema';
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
    type?: CalloutType;
  };
  disabled?: boolean;
  isMember?: boolean;
  contributionsCount?: number;
}

const CalloutClosedMarginal = ({
  callout,
  disabled = false,
  contributionsCount,
  isMember,
}: CalloutNotOpenStateMarginalProps) => {
  const { t } = useTranslation();

  const isClosed = useMemo(() => {
    const state = callout.contributionPolicy.state;

    if (!state || state === CalloutState.Open || disabled) {
      return false;
    }

    return !!callout.comments?.messages?.length;
  }, [callout.contributionPolicy.state, callout.comments?.messages, t]);

  if (!isClosed) {
    return !isMember && callout.type === CalloutType.Post && contributionsCount ? (
      <CalloutBlockMarginal variant="footer">{t('callout.notMember')}</CalloutBlockMarginal>
    ) : null;
  } else {
    return <CalloutBlockMarginal variant="footer">{t('callout.closed')}</CalloutBlockMarginal>;
  }
};

export default CalloutClosedMarginal;
