import { Box, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AuthActionButton, { type AuthActionButtonProps } from './Button';

export interface AcceptTermsButtonProps extends AuthActionButtonProps {
  hasAcceptedTerms: boolean;
  marginTop?: number;
}

const AcceptTermsButton = ({ hasAcceptedTerms, marginTop, ...buttonProps }: AcceptTermsButtonProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={t('pages.accept-terms.tooltip')}
      disableHoverListener={hasAcceptedTerms || !buttonProps.disabled}
      placement="top"
    >
      <Box marginTop={marginTop}>
        <AuthActionButton disabled={!hasAcceptedTerms} {...buttonProps} />
      </Box>
    </Tooltip>
  );
};

export default AcceptTermsButton;
