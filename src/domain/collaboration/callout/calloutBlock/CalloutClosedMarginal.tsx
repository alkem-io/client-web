import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CalloutBlockMarginal from './CalloutBlockMarginal';

interface CalloutNotOpenStateMarginalProps {
  callout: {
    settings: {
      contribution: {
        enabled: boolean;
      };
    };
    comments?: {
      messages?: unknown[];
    };
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
    if (disabled || !callout.settings.contribution.enabled) {
      return false;
    }
    if (callout.comments?.messages?.length) {
      return true;
    } else {
      return false;
    }
  }, [callout.settings.contribution, callout.comments?.messages, t]);

  if (!isClosed) {
    return !isMember && contributionsCount ? (
      <CalloutBlockMarginal variant="footer">{t('callout.notMember')}</CalloutBlockMarginal>
    ) : null;
  } else {
    return <CalloutBlockMarginal variant="footer">{t('callout.closed')}</CalloutBlockMarginal>;
  }
};

export default CalloutClosedMarginal;
