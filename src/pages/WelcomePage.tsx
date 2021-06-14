import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Section, { Header, SubHeader } from '../components/core/Section';
import Typography from '../components/core/Typography';
import { useEcoverse } from '../hooks/useEcoverse';
import { useUpdateNavigation } from '../hooks/useNavigation';
import { LOGO_REFERENCE_NAME } from '../models/Constants';

interface WelcomePageProps {}

export const WelcomePage: FC<WelcomePageProps> = () => {
  const { ecoverse } = useEcoverse();

  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

  const ecoverseLogo = ecoverse?.ecoverse.context?.references?.find(ref => ref.name === LOGO_REFERENCE_NAME)?.uri;
  const name = ecoverse?.ecoverse.displayName;
  const tagline = ecoverse?.ecoverse.context?.tagline;
  return (
    <Container>
      <Section
        avatar={
          ecoverseLogo ? (
            <img
              src={ecoverseLogo}
              alt={`${name} logo`}
              style={{ maxWidth: 320, height: 'initial', margin: '0 auto' }}
            />
          ) : (
            <div />
          )
        }
        hideDetails
      >
        <Header text={name} />
        <SubHeader text={tagline} />
      </Section>
      <div>
        <Typography variant={'h5'} className={'mb-4'}>
          Thank you for signing up - you are now a registered user on the platform and can explore the challenges hosted
          here further.
        </Typography>

        <Typography>
          Suggested next steps:
          <ul>
            <li>
              <Link to={'/'}>
                <strong>Browse:</strong>
              </Link>{' '}
              Review the set of hosted Challenges , as well as the Opportunities within each Challenge.
            </li>
            <li>
              Complete your{' '}
              <Link to={'/profile'}>
                <strong>profile:</strong>
              </Link>{' '}
              This makes it easier for others to find you, and your profile is also used when applying to join
              communities.
            </li>
            <li>
              <Link to={'/apply'}>
                <strong>Apply</strong>
              </Link>{' '}
              to become a member of the Ecoverse: your application is then reviewed based on your profile and
              application information.
            </li>
            <li>
              <Link to={'/community'}>
                <strong>Search</strong>
              </Link>{' '}
              for relevant Challenges and Opportunities
            </li>
          </ul>
        </Typography>

        <Typography>
          Once you are a member of the Ecoverse then there are additional options:
          <ul>
            <li>
              <strong>Contribute</strong>: After browsing the Challenges and Opportunites, join those that you want to
              contribute to and apply to join them.
            </li>
            <li>
              <Link to={'/community'}>
                <strong>Connect to other members.</strong>
              </Link>
            </li>
          </ul>
        </Typography>

        <Typography>As with any community, the more everyone brings in the more everyone gets out!</Typography>
        <Typography>We really hope you enjoy engaging!</Typography>
      </div>
    </Container>
  );
};
export default WelcomePage;
