import React, { FC, useMemo } from 'react';
import HubChallengesContainer from '../../containers/hub/HubChallengesContainer';
import HubPageContainer from '../../containers/hub/HubPageContainer';
import { useUpdateNavigation } from '../../hooks';
import { User } from '../../models/graphql-schema';
import HubDashboardView2 from '../../views/Hub/HubDashboardView2';
import { PageProps } from '../common';
import { getVisualBanner } from '../../utils/visuals.utils';

export interface HubDashboardPageProps extends PageProps {}

const HubDashboardPage: FC<HubDashboardPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'dashboard', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <HubPageContainer>
      {(entities, state) => {
        if (!entities || !state) return null;
        const communityReadAccess = entities.permissions.communityReadAccess;
        return (
          <HubChallengesContainer
            entities={{
              hubNameId: entities?.hub?.nameID || '',
            }}
          >
            {cEntities => (
              <HubDashboardView2
                title={entities?.hub?.displayName}
                bannerUrl={getVisualBanner(entities?.hub?.context?.visuals)}
                tagline={entities?.hub?.context?.tagline}
                vision={entities?.hub?.context?.vision}
                hubId={entities?.hub?.id}
                hubNameId={entities?.hub?.nameID}
                communityId={entities?.hub?.community?.id}
                organizationNameId={entities?.hub?.host?.nameID}
                activity={entities.activity}
                challenges={cEntities.challenges}
                discussions={entities.discussionList}
                members={entities?.hub?.community?.members as User[]}
                loading={state.loading}
                isMember={entities.isMember}
                communityReadAccess={communityReadAccess}
                challengesReadAccess={entities.permissions.challengesReadAccess}
              />
            )}
          </HubChallengesContainer>
        );
      }}
    </HubPageContainer>
  );
};
export default HubDashboardPage;
