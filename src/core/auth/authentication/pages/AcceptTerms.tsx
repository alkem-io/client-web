import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import { UiNodeInput } from '../components/UiNodeInput';
import KratosVisibleAcceptTermsCheckbox from '../components/KratosVisibleAcceptTermsCheckbox';
import { useState } from 'react';
import KratosAcceptTermsButton from '../components/KratosAcceptTermsButton';
import { useTranslation } from 'react-i18next';
import PlatformIntroduction from '../components/PlatformIntroduction';
import { UiContainer, UiNode } from '@ory/kratos-client';
import isAcceptTermsCheckbox from '../utils/isAcceptTermsCheckbox';
import KratosHidden from '../components/Kratos/KratosHidden';

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

const isInputNode = (node: UiNode): node is UiNodeInput => node.type === 'input';

const AcceptTerms = ({ ui }: KratosAcceptTermsProps) => {
  const termsCheckbox = ui.nodes.find(isAcceptTermsCheckbox) as UiNodeInput<boolean>;

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(termsCheckbox.attributes.value!);
  const { t } = useTranslation();

  const userNameInput = ui.nodes.find(node => node.attributes['name'] === 'traits.name.first') as
    | UiNodeInput<string>
    | undefined;
  const userName = userNameInput?.attributes.value ?? undefined;

  const buttonNode = ui.nodes
    .slice()
    .sort(node => (node.group === 'oidc' ? 1 : -1))
    .find(node => node.attributes['type'] === 'submit') as UiNodeInput;

  const otherInputs = ui.nodes.filter(node => isInputNode(node) && node.attributes.type !== 'submit');

  return (
    <>
      {otherInputs.map(node => (
        <KratosHidden key={node.attributes['name']} node={node} />
      ))}
      {userName && <Greeting userName={userName} />}
      <PlatformIntroduction label="pages.accept-terms.introduction" />
      <KratosVisibleAcceptTermsCheckbox node={termsCheckbox} value={hasAcceptedTerms} onChange={setHasAcceptedTerms} />
      <KratosAcceptTermsButton hasAcceptedTerms={hasAcceptedTerms} node={buttonNode} marginTop={2}>
        {t('pages.accept-terms.continue')}
      </KratosAcceptTermsButton>
    </>
  );
};

export default AcceptTerms;
