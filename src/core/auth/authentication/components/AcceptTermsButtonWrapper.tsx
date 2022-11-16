import { Box, Button, ButtonProps, Tooltip } from '@mui/material';
import { useHasAcceptedTerms } from './AcceptTermsContext';

interface AcceptTermsButtonWrapperProps extends ButtonProps {
  marginTop?: number;
}

const ButtonContinue = ({ marginTop, ...buttonProps }: AcceptTermsButtonWrapperProps) => {
  const hasAcceptedTerms = useHasAcceptedTerms();

  return (
    <Tooltip
      title="Please read and accept the Terms of Use and Privacy Policy before you continue"
      disableHoverListener={hasAcceptedTerms}
      placement="top"
    >
      <Box marginTop={marginTop}>
        <Button
          variant="contained"
          disabled={!hasAcceptedTerms}
          {...buttonProps}
          sx={{ width: '100%', justifyContent: 'start' }}
        />
      </Box>
    </Tooltip>
  );
};

export default ButtonContinue;
