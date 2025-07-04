import { useTranslation } from 'react-i18next';
import CalloutBlockMarginal from './CalloutBlockMarginal';

interface CalloutNotOpenStateMarginalProps {
  messagesCount: number;
  disabled?: boolean;
  isMember?: boolean;
  contributionsCount?: number;
}

const CalloutClosedMarginal = ({
  messagesCount,
  disabled = false,
  contributionsCount,
  isMember,
}: CalloutNotOpenStateMarginalProps) => {
  const { t } = useTranslation();

  if (!disabled) {
    return !isMember && contributionsCount ? (
      <CalloutBlockMarginal variant="footer">{t('callout.notMember')}</CalloutBlockMarginal>
    ) : null;
  }
  if (messagesCount) {
    return <CalloutBlockMarginal variant="footer">{t('callout.closed')}</CalloutBlockMarginal>;
  }

  return null;
};

export default CalloutClosedMarginal;
