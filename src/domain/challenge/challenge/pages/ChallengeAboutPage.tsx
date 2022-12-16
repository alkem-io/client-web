import React, { FC } from 'react';
import { useChallenge } from '../hooks/useChallenge';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { ChallengeAboutView } from '../views/ChallengeAboutView';

const ChallengeAboutPage: FC = () => {
  const { hubNameId, displayName: challengeDisplayName, challengeNameId, communityId } = useChallenge();

  return (
    <ChallengePageLayout currentSection={EntityPageSection.About}>
      <AboutPageContainer hubNameId={hubNameId} challengeNameId={challengeNameId}>
        {({ context, tagset, permissions, ...rest }, state) => (
          <ChallengeAboutView
            name={challengeDisplayName}
            tagline={context?.tagline}
            tags={tagset?.tags}
            who={context?.who}
            impact={context?.impact}
            background={context?.background}
            vision={context?.vision}
            communityReadAccess={permissions.communityReadAccess}
            hubNameId={hubNameId}
            communityId={communityId}
            {...rest}
            {...state}
          />
        )}
      </AboutPageContainer>
    </ChallengePageLayout>
  );
};

export default ChallengeAboutPage;
