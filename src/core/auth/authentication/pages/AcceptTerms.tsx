import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import Container from '../../../../domain/shared/layout/Container';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import { UiNodeInput } from '../components/UiNodeInput';
import KratosVisibleAcceptTermsCheckbox from '../components/KratosVisibleAcceptTermsCheckbox';
import { useState } from 'react';
import KratosAcceptTermsButton from '../components/KratosAcceptTermsButton';
import { useTranslation } from 'react-i18next';
import PlatformIntroduction from '../components/PlatformIntroduction';

interface GreetingProps {
  userName: string;
}

const Greeting = ({ userName }: GreetingProps) => {
  const { t } = useTranslation();
  return <SubHeading>{t('pages.accept-terms.greeting', { user: userName })}</SubHeading>;
};

export interface KratosAcceptTermsProps {
  userName?: string;
  checkboxNode: UiNodeInput;
  buttonNode: UiNodeInput;
}

const AcceptTerms = ({ userName, checkboxNode, buttonNode }: KratosAcceptTermsProps) => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(checkboxNode.attributes.value);
  const { t } = useTranslation();

  return (
    <Container maxWidth={sxCols(7)} gap={4}>
      {userName && <Greeting userName={userName} />}
      <PlatformIntroduction label="pages.accept-terms.introduction" />
      <KratosVisibleAcceptTermsCheckbox node={checkboxNode} value={hasAcceptedTerms} onChange={setHasAcceptedTerms} />
      <KratosAcceptTermsButton hasAcceptedTerms={hasAcceptedTerms} node={buttonNode} marginTop={2}>
        {t('pages.accept-terms.continue')}
      </KratosAcceptTermsButton>
    </Container>
  );
};

export default AcceptTerms;
