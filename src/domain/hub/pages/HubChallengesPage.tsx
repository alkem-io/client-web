import React, { FC, useMemo } from 'react';
import { useHub, useUpdateNavigation } from '../../../hooks';
import { PageProps } from '../../../pages/common';
import HubChallengesView from '../views/HubChallengesView';
import ChallengesCardContainer from '../../../containers/hub/ChallengesCardContainer';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import HubPageLayout from '../layout/HubPageLayout';

export interface HubChallengesPageProps extends PageProps {}

const HubChallengesPage: FC<HubChallengesPageProps> = ({ paths }) => {
  const { hubNameId, permissions } = useHub();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'challenges', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <HubPageLayout currentSection={EntityPageSection.Challenges}>
      <ChallengesCardContainer hubNameId={hubNameId}>
        {(entities, state) => (
          <HubChallengesView
            entities={{
              challenges: entities.challenges,
              hubNameId: hubNameId,
              permissions: {
                canReadChallenges: permissions.canReadChallenges,
              },
            }}
            state={{ loading: state.loading, error: state.error }}
            actions={{}}
            options={{}}
          />
        )}
      </ChallengesCardContainer>
    </HubPageLayout>
  );
};
export default HubChallengesPage;
