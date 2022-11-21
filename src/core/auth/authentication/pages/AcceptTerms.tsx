import { Box } from '@mui/material';
import Paragraph from '../../../../domain/shared/components/Text/Paragraph';
import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import Container from '../../../../domain/shared/layout/Container';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import AcceptTermsCheckbox from '../components/AcceptTermsCheckbox';
import { AcceptTermsContext } from '../components/AcceptTermsContext';
import AcceptTermsButtonWrapper from '../components/AcceptTermsButtonWrapper';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { useUserContext } from '../../../../domain/community/contributor/user';

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

const AcceptTerms = () => {
  const { user } = useUserContext();

  return (
    <Container marginTop={9} maxWidth={sxCols(7)} gap={4}>
      <FixedHeightLogo />
      {user && <Greeting userName={user.user.firstName} />}
      <Introduction />
      <AcceptTermsContext>
        <AcceptTermsCheckbox />
        <AcceptTermsButtonWrapper marginTop={2}>Continue to the platform</AcceptTermsButtonWrapper>
      </AcceptTermsContext>
    </Container>
  );
};

export default AcceptTerms;
