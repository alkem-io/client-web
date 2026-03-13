import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { Button, type ButtonProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';

interface TemplateActionButtonProps extends Omit<ButtonProps, 'startIcon' | 'variant'> {
  /**
   * Translation key for button text
   * @default 'buttons.use'
   */
  textKey?: TranslationKey;
}

export const TemplateActionButton = ({ textKey = 'buttons.use', ...props }: TemplateActionButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button startIcon={<SystemUpdateAltIcon />} variant="contained" {...props}>
      {t(textKey)}
    </Button>
  );
};

export default TemplateActionButton;
