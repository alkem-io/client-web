import { Box, Tooltip } from '@mui/material';
import AuthActionButton, { AuthActionButtonProps } from './Button';

export interface AcceptTermsButtonImplProps extends AuthActionButtonProps {
  hasAcceptedTerms: boolean;
  marginTop?: number;
}

const AcceptTermsButtonImpl = ({ hasAcceptedTerms, marginTop, ...buttonProps }: AcceptTermsButtonImplProps) => {
  return (
    <Tooltip
      title="Please read and accept the Terms of Use and Privacy Policy before you continue"
      disableHoverListener={hasAcceptedTerms}
      placement="top"
    >
      <Box marginTop={marginTop}>
        <AuthActionButton disabled={!hasAcceptedTerms} {...buttonProps} />
      </Box>
    </Tooltip>
  );
};

export default AcceptTermsButtonImpl;
