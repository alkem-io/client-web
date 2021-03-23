import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import Typography from '../components/core/Typography';
import { useEcoverse } from '../hooks/useEcoverse';
import { useUpdateNavigation } from '../hooks/useNavigation';

interface WelcomePageProps {}

export const WelcomePage: FC<WelcomePageProps> = () => {
  const { ecoverse } = useEcoverse();
  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });
  return (
    <Container>
      <div>
        <Typography variant={'h2'}>Welcome to the '{ecoverse?.ecoverse?.name}' ecoverse!</Typography>

        <Typography variant={'h3'}>{ecoverse?.ecoverse?.context?.tagline}</Typography>

        <Typography variant={'h5'}>{ecoverse?.ecoverse?.context?.background}</Typography>

        <Typography>
          In order to get the most value please:
          <ul>
            <li>
              Browse: Have a look through the public information from the hosted challenges, seeing which ones trigger
              your interest...
            </li>
            <li>
              Profile: Complete your profile [link to profile edit page], this makes it easier for others to find you,
              and will be used when applying to join various communities.
            </li>
            <li>Join: Apply to become a full member of the ecoverse [link to ecoverse application page]</li>
            <li>
              Contribute: After browsing the Challenges and Opportunites, join those that you want to contribute to and
              apply to join them.
            </li>
            <li>
              Use the search [link to search] functionality to find other relevant members , groups, organisations.
            </li>
          </ul>
        </Typography>

        <Typography>As with any community, the more everyone brings in the more everyone gets out!</Typography>

        <Typography>We really hope you enjoy engaging.</Typography>
      </div>
    </Container>
  );
};
export default WelcomePage;
