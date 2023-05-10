import { useTranslation } from 'react-i18next';
import RouterLink from '../link/RouterLink';
import { CaptionSmall } from '../typography';
import { ButtonBase } from '@mui/material';

interface SeeMoreProps {
  subject: string;
  to?: string;
  onClick?: () => void;
}

const SeeMore = ({ subject, to, onClick }: SeeMoreProps) => {
  const { t } = useTranslation();

  return (
    <CaptionSmall component={to ? RouterLink : ButtonBase} to={to} textAlign="right" onClick={onClick}>
      {t('buttons.see-all', { subject })}
    </CaptionSmall>
  );
};

export default SeeMore;
