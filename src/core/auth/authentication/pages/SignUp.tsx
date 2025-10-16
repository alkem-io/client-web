import { useCallback, useEffect, useMemo, useState } from 'react';
import { UiContainer, UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import { AcceptTermsContext } from '../components/AcceptTermsContext';
import { PARAM_NAME_RETURN_URL } from '../constants/authentication.constants';
import useKratosFlow, { FlowTypeName } from '../hooks/useKratosFlow';
import { produce } from 'immer';
import KratosUI from '../components/KratosUI';
import KratosVisibleAcceptTermsCheckbox from '../components/KratosVisibleAcceptTermsCheckbox';
import PlatformIntroduction from '../components/PlatformIntroduction';
import { useTranslation } from 'react-i18next';
import KratosForm from '../components/Kratos/KratosForm';
import {
  KRATOS_INPUT_NAME_CSRF,
  KRATOS_REQUIRED_FIELDS,
  KRATOS_TRAIT_NAME_FIRST_NAME,
  KRATOS_TRAIT_NAME_LAST_NAME,
} from '../components/Kratos/constants';
import { isInputNode, isSubmitButton } from '../components/Kratos/helpers';
import { useReturnUrl } from '../utils/useSignUpReturnUrl';
import { useQueryParams } from '@/core/routing/useQueryParams';
import AuthenticationLayout from '../AuthenticationLayout';
import { AuthFormHeader } from '../components/AuthFormHeader';
import { sortBy } from 'lodash';

const getMinimalSocialLoginNodes = (ui: UiContainer) =>
  ui.nodes.filter(
    node =>
      node.group === 'oidc' ||
      (isInputNode(node) &&
        (node.attributes.name === KRATOS_INPUT_NAME_CSRF ||
          KRATOS_REQUIRED_FIELDS.includes(node.attributes.name) ||
          isSubmitButton(node)))
  );

const SignUp = () => {
  const { flow } = useKratosFlow(FlowTypeName.Registration, undefined);

  const { t } = useTranslation();

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Sign Up flow is a flow reduced to just showing Accept Terms checkbox, Email and a selection of Sign Up options.
  const signUpFlow =
    flow &&
    produce(flow, nextFlow => {
      // sort the nodes alphabetically by name so `Accept terms` goes above `Email` field - not ideal but should do
      nextFlow.ui.nodes = sortBy(getMinimalSocialLoginNodes(nextFlow.ui), ['attributes.name']);
    });

  useEffect(() => {
    if (!signUpFlow) {
      return;
    }

    const getNodeValueByName = (nodeName: string) => {
      const node = signUpFlow.ui.nodes.find(
        candidate => isInputNode(candidate) && candidate.attributes.name === nodeName
      ) as (UiNode & { attributes: UiNodeInputAttributes }) | undefined;

      const nodeValue = node?.attributes.value;
      if (typeof nodeValue === 'string') {
        return nodeValue;
      }

      if (typeof nodeValue === 'number') {
        return String(nodeValue);
      }

      return '';
    };

    const nextFirstName = getNodeValueByName(KRATOS_TRAIT_NAME_FIRST_NAME);
    const nextLastName = getNodeValueByName(KRATOS_TRAIT_NAME_LAST_NAME);

    if (!firstName && nextFirstName) {
      setFirstName(nextFirstName);
    }

    if (!lastName && nextLastName) {
      setLastName(nextLastName);
    }
  }, [signUpFlow, firstName, lastName]);

  const handleInputChange = useCallback((node: UiNode, value: string) => {
    if (!isInputNode(node)) {
      return;
    }

    const inputName = node.attributes.name;

    if (inputName === KRATOS_TRAIT_NAME_FIRST_NAME) {
      setFirstName(value);
      return;
    }

    if (inputName === KRATOS_TRAIT_NAME_LAST_NAME) {
      setLastName(value);
    }
  }, []);

  const isSubmitDisabled = useMemo(() => {
    if (!hasAcceptedTerms) {
      return true;
    }

    return firstName.trim().length < 1 || lastName.trim().length < 1;
  }, [firstName, hasAcceptedTerms, lastName]);

  // Sign Up inits a new flow, otherwise Kratos complains about missing fields like email
  // which a user had no chance to fill because they weren't even on the page.
  const params = useQueryParams();
  const returnUrl = params.get(PARAM_NAME_RETURN_URL);
  const { setReturnUrl } = useReturnUrl();

  useEffect(() => {
    setReturnUrl(returnUrl);
  }, [returnUrl, setReturnUrl]);

  if (!signUpFlow) {
    return null;
  }

  return (
    <AuthenticationLayout>
      <AuthFormHeader title={t('authentication.sign-up')} haveAccountMessage />
      <KratosForm ui={signUpFlow?.ui}>
        <AuthPageContentContainer>
          <PlatformIntroduction label="pages.registration.introduction-short" />
          <AcceptTermsContext hasAcceptedTerms={hasAcceptedTerms}>
            <KratosUI
              disableInputs={!hasAcceptedTerms}
              submitDisabled={isSubmitDisabled}
              onInputChange={handleInputChange}
              ui={signUpFlow?.ui}
              flowType="registration"
              renderAcceptTermsCheckbox={checkbox => (
                <KratosVisibleAcceptTermsCheckbox
                  value={hasAcceptedTerms}
                  onChange={setHasAcceptedTerms}
                  node={checkbox}
                  sx={{ marginBottom: 2, alignSelf: 'center' }}
                />
              )}
            />
          </AcceptTermsContext>
        </AuthPageContentContainer>
      </KratosForm>
    </AuthenticationLayout>
  );
};

export default SignUp;
