import { Box, Button, ButtonProps, Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import LogoComponent from '../../../../common/components/composite/layout/TopBar/LogoComponent';
import Paragraph from '../../../../domain/shared/components/Text/Paragraph';
import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import { useState } from 'react';
import Container from '../../../../domain/shared/layout/Container';
import { sxCols } from '../../../../domain/shared/layout/Grid';

const Introduction = () => {
  return (
    <Box>
      <Paragraph textAlign="center">
        Alkemio makes it easy to manage Challenges and have contributors, from anywhere, working together on solutions.
        Challenges take center-stage. Focus is on the destination.
      </Paragraph>
      <Paragraph textAlign="center">
        To keep the platform safe, open, and constructive, every user must accept the Terms of Use and Privacy Policy.
        Please read the these documents and accept them below before you continue.
      </Paragraph>
    </Box>
  );
};

const Greeting = () => {
  return <SubHeading>Hi [first name], welcome at Alkemio!</SubHeading>;
};

interface AcceptTermsCheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const AcceptTermsCheckbox = ({ value, onChange }: AcceptTermsCheckboxProps) => {
  return (
    <Box>
      <FormControlLabel
        value={value}
        onChange={(event, nextValue) => onChange(nextValue)}
        control={<Checkbox />}
        label="I accept the Terms of Use and Privacy Policy."
        disableTypography
        sx={{ fontSize: 15 }}
      />
    </Box>
  );
};

const ButtonContinue = (props: ButtonProps) => {
  return (
    <Tooltip
      title="Please read and accept the Terms of Use and Privacy Policy before you continue"
      disableHoverListener={!props.disabled}
      placement="top"
    >
      <Box marginTop={2}>
        <Button variant="contained" {...props}>
          Continue to the platform
        </Button>
      </Box>
    </Tooltip>
  );
};

const AcceptTerms = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  return (
    <Container marginTop={9} maxWidth={sxCols(7)} gap={4}>
      <LogoComponent height={theme => theme.spacing(6)} />
      <Greeting />
      <Introduction />
      <AcceptTermsCheckbox value={hasAcceptedTerms} onChange={value => setHasAcceptedTerms(value)} />
      <ButtonContinue disabled={!hasAcceptedTerms} />
    </Container>
  );
};

export default AcceptTerms;
