import React, { FC } from 'react';
import { useChallenge } from '../hooks/useChallenge';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import { ChallengeAboutView } from '../views/ChallengeAboutView';
import ChallengeDashboardPage from './ChallengeDashboardPage';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';

const ChallengeAboutPage: FC = () => {
  const { spaceNameId, profile, challengeNameId, communityId } = useChallenge();

  const [backToParentPage] = useBackToParentPage('../dashboard');

  return (
    <>
      <ChallengeDashboardPage />
      <DialogWithGrid open columns={12} onClose={backToParentPage}>
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
      </DialogWithGrid>
    </>
  );
};

export default ChallengeAboutPage;
