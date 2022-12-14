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
            {...rest}
            {...state}
          />
        )}
      </AboutPageContainer>
    </ChallengePageLayout>
  );
};
export default ChallengeAboutPage;
