import React, { FC } from 'react';
import { useChallenge } from '../hooks/useChallenge';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { PageProps } from '../../../shared/types/PageProps';
import { ChallengeAboutView } from '../views/ChallengeAboutView';

export interface ChallengeContextPageProps extends PageProps {}

const ChallengeAboutPage: FC<ChallengeContextPageProps> = () => {
  const { hubNameId, displayName: challengeDisplayName, challengeNameId } = useChallenge();

  return (
    <ChallengePageLayout currentSection={EntityPageSection.About}>
      <AboutPageContainer hubNameId={hubNameId} challengeNameId={challengeNameId}>
        {(entities, state) => (
          <ChallengeAboutView
            name={challengeDisplayName}
            tagline={entities.context?.tagline}
            tags={entities.tagset?.tags}
            who={entities.context?.who}
            vision={entities.context?.vision}
            loading={state.loading}
          />
        )}
      </AboutPageContainer>
    </ChallengePageLayout>
  );
};
export default ChallengeAboutPage;
