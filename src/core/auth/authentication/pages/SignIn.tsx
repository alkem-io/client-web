import Container from '../../../../domain/shared/layout/Container';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import Paragraph from '../../../../domain/shared/components/Text/Paragraph';
import { Box } from '@mui/material';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { ReactComponent as LinkedInIcon } from '../components/AuthProviders/LinkedIn.svg';
import { ReactComponent as MicrosoftIcon } from '../components/AuthProviders/Microsoft.svg';
import ButtonStyling from '../components/AuthProviders/ButtonStyling';
import linkedInTheme from '../components/AuthProviders/LinkedInTheme';
import microsoftTheme from '../components/AuthProviders/MicrosoftTheme';
import AuthActionButton from '../components/Button';
import useKratosFlow, { FlowTypeName } from '../hooks/useKratosFlow';
import KratosUI from '../components/KratosUI';
import React, { useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../../../../common/components/core/Loading/Loading';
import { useTranslation } from 'react-i18next';
import { SelfServiceLoginFlow } from '@ory/kratos-client';

interface SignInPageProps {
  flow?: string;
}

const EMAIL_NOT_VERIFIED_MESSAGE_ID = 4000010;

const isEmailNotVerified = (flow: SelfServiceLoginFlow) => {
  return flow.ui.messages?.some(({ id }) => id === EMAIL_NOT_VERIFIED_MESSAGE_ID);
};

// See a TODO below
// const EMAIL_FIELD_NAME = 'password_identifier';
//
// const getEmailAddress = (flow: SelfServiceLoginFlow): string | undefined => {
//   const node = flow.ui.nodes.find((node ) => {
//     const attributes = node.attributes as UiNodeInputAttributes;
//     return attributes.name === EMAIL_FIELD_NAME;
//   });
//   return node && (node.attributes as UiNodeInputAttributes).value;
// };

const SignIn = ({ flow }: SignInPageProps) => {
  const { flow: loginFlow, loading } = useKratosFlow(FlowTypeName.Login, flow);

  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (loginFlow && isEmailNotVerified(loginFlow)) {
      // TODO When Kratos starts sending email value back, this snippet may be used
      // to allow users request the verification email once again
      // without having to input email manually.
      // const email = getEmailAddress(loginFlow);
      // const params = new URLSearchParams();
      // if (email) {
      //   params.set('email', email);
      // }
      navigate('/identity/verify/reminder');
    }
  }, [loginFlow, navigate]);

  const resetPassword = (
    <Box
      display="flex"
      justifyContent="end"
      paddingX={2}
      component={Link}
      to="/identity/recovery"
      fontSize={12}
      fontFamily={theme => theme.typography.caption.fontFamily}
      fontWeight={600}
      sx={{ color: theme => theme.palette.primaryDark.main }}
    >
      Reset password
    </Box>
  );

  const { t } = useTranslation();

  if (loading) return <Loading text={t('kratos.loading-flow')} />;

  // TODO merge maxWidth???
  return (
    <Container marginTop={9} maxWidth={sxCols(7)} gap={4}>
      <FixedHeightLogo />
      <SubHeading>Sign in to Alkemio</SubHeading>
      <KratosUI flow={loginFlow} resetPasswordElement={resetPassword}>
        <Paragraph textAlign="center" marginY={2} textTransform="uppercase">
          Or
        </Paragraph>
        <ButtonStyling
          options={linkedInTheme}
          icon={<LinkedInIcon />}
          component={AuthActionButton}
          justifyContent="start"
        >
          Sign up with LinkedIn
        </ButtonStyling>
        <ButtonStyling
          options={microsoftTheme}
          icon={<MicrosoftIcon />}
          component={AuthActionButton}
          justifyContent="start"
        >
          Sign up with Microsoft
        </ButtonStyling>
      </KratosUI>
    </Container>
  );
};

export default SignIn;
