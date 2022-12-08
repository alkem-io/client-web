import React, { FC } from 'react';
import { useHub } from '../../hub/HubContext/useHub';
import { useChallenge } from '../hooks/useChallenge';
import ContextTabContainer from '../../../context/ContextTabContainer/ContextTabContainer';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { PageProps } from '../../../shared/types/PageProps';
import { ChallengeAboutView } from '../views/ChallengeAboutView';

export interface ChallengeContextPageProps extends PageProps {}

const ChallengeAboutPage: FC<ChallengeContextPageProps> = ({}) => {
  const { displayName: hubDisplayName } = useHub();
  const { hubNameId, displayName: challengeDisplayName, challengeId, challengeNameId } = useChallenge();

  return (
    <ChallengePageLayout currentSection={EntityPageSection.About}>
      <ContextTabContainer hubNameId={hubNameId} challengeNameId={challengeNameId}>
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
      </ContextTabContainer>
    </ChallengePageLayout>
  );
};
export default ChallengeAboutPage;
