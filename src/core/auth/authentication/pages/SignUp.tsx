import Container from '../../../../domain/shared/layout/Container';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import Paragraph from '../../../../domain/shared/components/Text/Paragraph';
import { Box } from '@mui/material';
import { AcceptTermsContext } from '../components/AcceptTermsContext';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { EmailOutlined } from '@mui/icons-material';
import { Theme } from '@mui/material/styles';
import AuthActionButton from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from '../../../../models/constants';
import useKratosFlow, { FlowTypeName } from '../hooks/useKratosFlow';
import produce from 'immer';
import KratosUI from '../components/KratosUI';
import { useState } from 'react';
import AcceptTermsButtonImpl from '../components/AcceptTermsButtonImpl';
import AcceptTermsButtonContextual from '../components/AcceptTermsButtonContextual';
import KratosVisibleAcceptTermsCheckbox from '../components/KratosVisibleAcceptTermsCheckbox';

const EmailIcon = () => {
  const size = (theme: Theme) => theme.spacing(3);
  return <EmailOutlined sx={{ height: size, width: size }} />;
};

const SignUp = () => {
  const { flow } = useKratosFlow(FlowTypeName.Registration, undefined);

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  // Sign Up flow is a flow reduced to just showing Accept Terms checkbox and a selection of Sign Up options.
  const signUpFlow =
    flow &&
    produce(flow, nextFlow => {
      const socialFlowNodes = nextFlow.ui.nodes.filter(
        node =>
          // Just the essentials for choosing/initializing a flow
          node.attributes['name'] === 'csrf_token' ||
          node.attributes['name'] === 'traits.accepted_terms' ||
          node.group === 'oidc'
      );
      nextFlow.ui.nodes = socialFlowNodes;
    });

  const navigate = useNavigate();

  // Sign Up inits a new flow, otherwise Kratos complains about missing fields like email
  // which a user had no chance to fill because they weren't even on the page.
  const signUp = () => {
    navigate(AUTH_REGISTER_PATH, {
      replace: true,
      state: {
        hasAcceptedTerms: true,
      },
    });
  };

  const signIn = () => {
    navigate(AUTH_LOGIN_PATH);
  };

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
      {/*<AcceptTermsCheckbox value={hasAcceptedTerms} onChange={setHasAcceptedTerms} />*/}
      <AcceptTermsContext hasAcceptedTerms={hasAcceptedTerms}>
        <KratosUI
          flow={signUpFlow}
          buttonComponent={AcceptTermsButtonContextual}
          renderAcceptTermsCheckbox={checkbox => (
            <KratosVisibleAcceptTermsCheckbox
              value={hasAcceptedTerms}
              onChange={setHasAcceptedTerms}
              node={checkbox}
              sx={{ marginBottom: 2, alignSelf: 'center' }}
            />
          )}
        >
          <AcceptTermsButtonImpl
            hasAcceptedTerms={hasAcceptedTerms}
            startIcon={<EmailIcon />}
            color="primaryDark"
            justifyContent="start"
            onClick={signUp}
          >
            Sign up with E-Mail
          </AcceptTermsButtonImpl>
          <Paragraph textAlign="center" marginY={4}>
            Already have an account?
          </Paragraph>
          <AuthActionButton color="primaryDark" onClick={signIn}>
            Sign in
          </AuthActionButton>
        </KratosUI>
      </AcceptTermsContext>
    </Container>
  );
};

export default SignUp;
