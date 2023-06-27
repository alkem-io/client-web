import React, { FC } from 'react';
import { useChallenge } from '../hooks/useChallenge';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { ChallengeAboutView } from '../views/ChallengeAboutView';

const ChallengeAboutPage: FC = () => {
  const { spaceNameId, profile, challengeNameId, communityId } = useChallenge();

  return (
    <ChallengePageLayout currentSection={EntityPageSection.About}>
      <AboutPageContainer spaceNameId={spaceNameId} challengeNameId={challengeNameId}>
        {({ context, tagset, permissions, ...rest }, state) => (
          <ChallengeAboutView
            name={profile?.displayName}
            tagline={profile?.tagline}
            tags={tagset?.tags}
            who={context?.who}
            impact={context?.impact}
            background={profile?.description}
            vision={context?.vision}
            communityReadAccess={permissions.communityReadAccess}
            spaceNameId={spaceNameId}
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
