import React, { FC, useMemo } from 'react';
import EcoverseChallengesContainer from '../../containers/hub/EcoverseChallengesContainer';
import EcoversePageContainer from '../../containers/hub/EcoversePageContainer';
import { useUpdateNavigation } from '../../hooks';
import { User } from '../../models/graphql-schema';
import EcoverseDashboardView2 from '../../views/Ecoverse/EcoverseDashboardView2';
import { PageProps } from '../common';
import { getVisualBanner } from '../../utils/visuals.utils';

export interface EcoverseDashboardPageProps extends PageProps {}

const EcoverseDashboardPage: FC<EcoverseDashboardPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'dashboard', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <EcoversePageContainer>
      {(entities, state) => {
        if (!entities || !state) return null;
        const communityReadAccess = entities.permissions.communityReadAccess;
        return (
          <EcoverseChallengesContainer
            entities={{
              hubNameId: entities?.hub?.nameID || '',
            }}
          >
            {cEntities => (
              <EcoverseDashboardView2
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
          </EcoverseChallengesContainer>
        );
      }}
    </EcoversePageContainer>
  );
};
export default EcoverseDashboardPage;
