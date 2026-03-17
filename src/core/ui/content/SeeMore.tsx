import { ButtonBase, type SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import RouterLink from '../link/RouterLink';
import { CaptionSmall } from '../typography';

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
      {t(label, { subject })}
    </CaptionSmall>
  );
};

export default SeeMore;
