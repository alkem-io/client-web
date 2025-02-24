import { useTranslation } from 'react-i18next';
import RouterLink from '../link/RouterLink';
import { CaptionSmall } from '../typography';
import { ButtonBase, SxProps } from '@mui/material';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { Theme } from '@mui/material/styles';

type SeeMoreProps = {
  label?: TranslationKey;
  subject?: string;
  to?: string;
  onClick?: () => void;
  sx?: SxProps<Theme>;
};

const SeeMore = ({ label = 'buttons.see-all', subject, to, onClick, sx }: SeeMoreProps) => {
  const { t } = useTranslation();

  return (
    <CaptionSmall component={to ? RouterLink : ButtonBase} to={to} textAlign="right" onClick={onClick} sx={sx}>
      <>{t(label, { subject })}</>
    </CaptionSmall>
  );
};

export default SeeMore;
