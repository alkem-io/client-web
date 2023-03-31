import { useEffect, useRef, useState } from 'react';
import AuthPageContentContainer from '../../../../domain/shared/layout/AuthPageContentContainer';
import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import Paragraph from '../../../../domain/shared/components/Text/Paragraph';
import { AcceptTermsContext } from '../components/AcceptTermsContext';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { EmailOutlined } from '@mui/icons-material';
import { Theme } from '@mui/material/styles';
import AuthActionButton from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { _AUTH_REGISTER_PATH, AUTH_LOGIN_PATH, STORAGE_KEY_RETURN_URL } from '../constants/authentication.constants';
import useKratosFlow, { FlowTypeName } from '../hooks/useKratosFlow';
import produce from 'immer';
import KratosUI from '../components/KratosUI';
import AcceptTermsButton from '../components/AcceptTermsButton';
import AcceptTermsButtonContextual from '../components/AcceptTermsButtonContextual';
import KratosVisibleAcceptTermsCheckbox from '../components/KratosVisibleAcceptTermsCheckbox';
import PlatformIntroduction from '../components/PlatformIntroduction';
import { useTranslation } from 'react-i18next';
import KratosForm from '../components/Kratos/KratosForm';
import { UiContainer } from '@ory/kratos-client';
import { KRATOS_INPUT_NAME_CSRF, KRATOS_TRAIT_NAME_ACCEPTED_TERMS } from '../components/Kratos/constants';
import { isInputNode } from '../components/Kratos/helpers';
import { getReturnUrlKeyForFlow } from '../utils/SignUpReturnUrl';

const EmailIcon = () => {
  const size = (theme: Theme) => theme.spacing(3);
  return <EmailOutlined sx={{ height: size, width: size }} />;
};

const getMinimalSocialLoginNodes = (ui: UiContainer) =>
  ui.nodes.filter(
    node =>
      node.group === 'oidc' ||
      (isInputNode(node) &&
        (node.attributes.name === KRATOS_INPUT_NAME_CSRF || node.attributes.name === KRATOS_TRAIT_NAME_ACCEPTED_TERMS))
  );

const SignUp = () => {
  const { flow } = useKratosFlow(FlowTypeName.Registration, undefined);

  const { t } = useTranslation();

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  // Sign Up flow is a flow reduced to just showing Accept Terms checkbox and a selection of Sign Up options.
  const signUpFlow =
    flow &&
    produce(flow, nextFlow => {
      nextFlow.ui.nodes = getMinimalSocialLoginNodes(nextFlow.ui);
    });

  const navigate = useNavigate();

  // Sign Up inits a new flow, otherwise Kratos complains about missing fields like email
  // which a user had no chance to fill because they weren't even on the page.
  const signUp = () => {
    navigate(_AUTH_REGISTER_PATH, {
      replace: true,
      state: {
        hasAcceptedTerms: true,
      },
    });
  };

  const signIn = () => {
    navigate(AUTH_LOGIN_PATH);
  };

  const returnUrl = useRef(sessionStorage.getItem(STORAGE_KEY_RETURN_URL)).current;

  useEffect(() => {
    // See src/core/auth/authentication/utils/SignUpReturnUrl.ts for the reason flow.id is here.
    if (flow?.id && returnUrl) {
      localStorage.setItem(getReturnUrlKeyForFlow(), returnUrl);
    }
  }, [flow?.id]);

  return (
    <KratosForm ui={signUpFlow?.ui}>
      <AuthPageContentContainer>
        <FixedHeightLogo />
        <SubHeading textAlign="center">{t('pages.registration.header')}</SubHeading>
        <PlatformIntroduction label="pages.registration.introduction" />
        <AcceptTermsContext hasAcceptedTerms={hasAcceptedTerms}>
          <KratosUI
            ui={signUpFlow?.ui}
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
            <AcceptTermsButton
              hasAcceptedTerms={hasAcceptedTerms}
              startIcon={<EmailIcon />}
              justifyContent="start"
              onClick={signUp}
            >
              Sign up with E-Mail
            </AcceptTermsButton>
            <Paragraph textAlign="center" marginY={4}>
              Already have an account?
            </Paragraph>
            <AuthActionButton onClick={signIn}>Sign in</AuthActionButton>
          </KratosUI>
        </AcceptTermsContext>
      </AuthPageContentContainer>
    </KratosForm>
  );
};

export default SignUp;
