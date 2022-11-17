import { Box, Tooltip } from '@mui/material';
import { useHasAcceptedTerms } from './AcceptTermsContext';
import AuthActionButton, { AuthActionButtonProps } from './Button';

interface AcceptTermsButtonWrapperProps extends AuthActionButtonProps {
  marginTop?: number;
}

const AcceptTermsButtonWrapper = ({ marginTop, ...buttonProps }: AcceptTermsButtonWrapperProps) => {
  const hasAcceptedTerms = useHasAcceptedTerms();

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

export default AcceptTermsButtonWrapper;
