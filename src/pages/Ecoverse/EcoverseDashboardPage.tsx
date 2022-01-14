import React, { FC } from 'react';
import EcoverseChallengesContainer from '../../containers/ecoverse/EcoverseChallengesContainer';
import EcoversePageContainer from '../../containers/ecoverse/EcoversePageContainer';
import { useUpdateNavigation } from '../../hooks';
import { User } from '../../models/graphql-schema';
import EcoverseDashboardView2 from '../../views/Ecoverse/EcoverseDashboardView2';
import { PageProps } from '../common';

export interface EcoverseDashboardPageProps extends PageProps {}

const EcoverseDashboardPage: FC<EcoverseDashboardPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <EcoversePageContainer>
      {(entities, state) => {
        if (!entities || !state) return null;
        const communityReadAccess = entities.permissions.communityReadAccess;
        return (
          <EcoverseChallengesContainer
            entities={{
              ecoverseNameId: entities?.ecoverse?.nameID || '',
            }}
          >
            {cEntities => (
              <EcoverseDashboardView2
                title={entities?.ecoverse?.displayName}
                bannerUrl={entities?.ecoverse?.context?.visual?.banner}
                tagline={entities?.ecoverse?.context?.tagline}
                vision={entities?.ecoverse?.context?.vision}
                ecoverseId={entities?.ecoverse?.id}
                ecoverseNameId={entities?.ecoverse?.nameID}
                communityId={entities?.ecoverse?.community?.id}
                organizationNameId={entities?.ecoverse?.host?.nameID}
                activity={entities.activity}
                challenges={cEntities.challenges}
                discussions={entities.discussionList}
                members={entities?.ecoverse?.community?.members as User[]}
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
