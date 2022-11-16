import Container from '../../../../domain/shared/layout/Container';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import Paragraph from '../../../../domain/shared/components/Text/Paragraph';
import { Box, Button, ButtonProps, createTheme, ThemeProvider } from '@mui/material';
import AcceptTermsCheckbox from '../components/AcceptTermsCheckbox';
import AcceptTermsButtonWrapper from '../components/AcceptTermsButtonWrapper';
import { AcceptTermsContext } from '../components/AcceptTermsContext';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { ReactComponent as LinkedInIcon } from '../components/OAuthProviders/LinkedIn.svg';
import { ReactComponent as MicrosoftIcon } from '../components/OAuthProviders/Microsoft.svg';
import { EmailOutlined } from '@mui/icons-material';
import { Theme } from '@mui/material/styles';

const linkedInTheme = {
  palette: {
    primary: {
      main: '#0076B2',
    },
  },
};

const microsoftTheme = {
  palette: {
    primary: {
      main: '#fff',
    },
  },
};

const EmailIcon = () => {
  const size = (theme: Theme) => theme.spacing(3);
  return <EmailOutlined sx={{ height: size, width: size }} />;
};

const SignUp = () => {
  return (
    <Container marginTop={9} maxWidth={sxCols(7)} gap={4}>
      <FixedHeightLogo />
      <SubHeading>Create an account to start using Alkemio</SubHeading>
      <Box>
        <Paragraph textAlign="center">
          Welcome at Alkemio! Alkemio makes it easy to manage Challenges and have contributors, from anywhere, working
          together on solutions. Challenges take center-stage. Focus is on the destination.
        </Paragraph>
        <Paragraph textAlign="center">
          To keep the platform safe, open, and constructive, every user must accept the Terms of Use and Privacy Policy.
          Please read the these documents and accept them below before continuing to sign up.
        </Paragraph>
      </Box>
      <AcceptTermsContext>
        <AcceptTermsCheckbox />
        <Box display="flex" flexDirection="column" alignItems="stretch" gap={2} marginTop={2}>
          <ThemeProvider
            theme={theme => createTheme({ ...theme, palette: { ...theme.palette, ...linkedInTheme.palette } })}
          >
            <AcceptTermsButtonWrapper startIcon={<LinkedInIcon />}>Sign up with LinkedIn</AcceptTermsButtonWrapper>
          </ThemeProvider>
          <ThemeProvider
            theme={theme => createTheme({ ...theme, palette: { ...theme.palette, ...microsoftTheme.palette } })}
          >
            <AcceptTermsButtonWrapper startIcon={<MicrosoftIcon />}>Sign up with Microsoft</AcceptTermsButtonWrapper>
          </ThemeProvider>
          <AcceptTermsButtonWrapper startIcon={<EmailIcon />} color={'primaryDark' as ButtonProps['color']}>
            Sign up with E-Mail
          </AcceptTermsButtonWrapper>
          {/*The following text and the button are put into the same Box for all the buttons to be of the same width*/}
          <Paragraph textAlign="center" marginY={4}>
            Already have an account?
          </Paragraph>
          <Button variant="contained" color={'primaryDark' as ButtonProps['color']}>
            Sign in
          </Button>
        </Box>
      </AcceptTermsContext>
    </Container>
  );
};

export default SignUp;
