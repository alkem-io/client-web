import { Box } from '@mui/material';
import Paragraph from '../../../../domain/shared/components/Text/Paragraph';
import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import Container from '../../../../domain/shared/layout/Container';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import { useUserContext } from '../../../../domain/community/contributor/user';
import { UiNodeInput } from '../components/UiNodeInput';
import KratosVisibleAcceptTermsCheckbox from '../components/KratosVisibleAcceptTermsCheckbox';
import { useState } from 'react';
import KratosAcceptTermsButton from '../components/KratosAcceptTermsButton';

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

interface GreetingProps {
  userName: string;
}

const Greeting = ({ userName }: GreetingProps) => {
  return <SubHeading>Hi {userName}, welcome at Alkemio!</SubHeading>;
};

export interface KratosAcceptTermsProps {
  checkboxNode: UiNodeInput;
  buttonNode: UiNodeInput;
}

const AcceptTerms = ({ checkboxNode, buttonNode }: KratosAcceptTermsProps) => {
  const { user } = useUserContext();

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(checkboxNode.attributes.value);

  return (
    <Container maxWidth={sxCols(7)} gap={4}>
      {user && <Greeting userName={user.user.firstName} />}
      <Introduction />
      <KratosVisibleAcceptTermsCheckbox node={checkboxNode} value={hasAcceptedTerms} onChange={setHasAcceptedTerms} />
      <KratosAcceptTermsButton hasAcceptedTerms={hasAcceptedTerms} node={buttonNode} marginTop={2}>
        Continue to the platform
      </KratosAcceptTermsButton>
    </Container>
  );
};

export default AcceptTerms;
