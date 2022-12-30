import { useTranslation } from 'react-i18next';
import RouterLink from '../link/RouterLink';
import { CaptionSmall } from '../typography';

interface SeeMoreProps {
  subject: string;
  to: string;
}

const SeeMore = ({ subject, to }: SeeMoreProps) => {
  const { t } = useTranslation();

  return (
    <CaptionSmall component={RouterLink} to={to} textAlign="right">
      {t('buttons.see-all', { subject })}
    </CaptionSmall>
  );
};

export default SeeMore;
