import SubHeading from '@/domain/shared/components/Text/SubHeading';
import KratosVisibleAcceptTermsCheckbox from '../components/KratosVisibleAcceptTermsCheckbox';
import { useState } from 'react';
import KratosAcceptTermsButton from '../components/KratosAcceptTermsButton';
import { useTranslation } from 'react-i18next';
import PlatformIntroduction from '../components/PlatformIntroduction';
import { UiContainer } from '@ory/kratos-client';
import isAcceptTermsCheckbox from '../utils/isAcceptTermsCheckbox';
import KratosHidden from '../components/Kratos/KratosHidden';
import { KRATOS_TRAIT_NAME_FIRST_NAME } from '../components/Kratos/constants';
import { isInputNode, isSubmitButton } from '../components/Kratos/helpers';

interface GreetingProps {
  userName: string;
}

const Greeting = ({ userName }: GreetingProps) => {
  const { t } = useTranslation();
  return <SubHeading>{t('pages.accept-terms.greeting', { user: userName })}</SubHeading>;
};

export interface KratosAcceptTermsProps {
  ui: UiContainer;
}

const getUserName = (ui: UiContainer) => {
  const userNameInput = ui.nodes.find(
    node => isInputNode(node) && node.attributes.name === KRATOS_TRAIT_NAME_FIRST_NAME
  );
  if (userNameInput && isInputNode(userNameInput)) {
    return userNameInput.attributes.value;
  }
  return undefined;
};

const getSubmitButtonPreferNonOIDC = (ui: UiContainer) =>
  ui.nodes
    .slice()
    .sort(node => (node.group === 'oidc' ? 1 : -1))
    .find(isSubmitButton);

const AcceptTerms = ({ ui }: KratosAcceptTermsProps) => {
  const termsCheckbox = ui.nodes.find(isAcceptTermsCheckbox);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(
    termsCheckbox && isInputNode(termsCheckbox) ? termsCheckbox.attributes.value : false
  );
  const { t } = useTranslation();

  const userName = getUserName(ui);

  const buttonNode = getSubmitButtonPreferNonOIDC(ui);

  const nonButtonInputs = ui.nodes.filter(node => !isSubmitButton(node));

  return (
    <>
      {nonButtonInputs.map(node => (
        <KratosHidden key={node.attributes['name']} node={node} />
      ))}
      {userName && <Greeting userName={userName} />}
      <PlatformIntroduction label="pages.accept-terms.introduction" />
      {termsCheckbox && (
        <KratosVisibleAcceptTermsCheckbox
          node={termsCheckbox}
          value={hasAcceptedTerms}
          onChange={setHasAcceptedTerms}
        />
      )}
      {buttonNode && (
        <KratosAcceptTermsButton hasAcceptedTerms={hasAcceptedTerms} node={buttonNode} marginTop={2}>
          {t('pages.accept-terms.continue')}
        </KratosAcceptTermsButton>
      )}
    </>
  );
};

export default AcceptTerms;
