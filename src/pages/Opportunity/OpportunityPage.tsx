import { TabContext, TabPanel } from '@mui/lab';
import React, { FC } from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import { OpportunityPageContainer } from '../../containers';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import { useUpdateNavigation } from '../../hooks';
import DiscussionsRoute from '../../routing/discussions/DiscussionsRoute';
import OpportunityTabs from '../../routing/opportunity/OpportunityTabs';
import RestrictedRoute from '../../routing/route.extensions';
import OpportunityContextView from '../../views/Opportunity/OpportunityContextView';
import OpportunityDashboardView from '../../views/Opportunity/OpportunityDashboardView';
import OpportunityProjectsView from '../../views/Opportunity/OpportunityProjectsView';
import { PageProps } from '../common';
import OpportunityCommunityPage from '../Community/OpportunityCommunityPage';

interface OpportunityPageProps extends PageProps {}

const OpportunityPage: FC<OpportunityPageProps> = ({ paths }) => {
  const { path } = useRouteMatch();
  useUpdateNavigation({ currentPaths: paths });

  return (
    <DiscussionsProvider>
      <OpportunityPageContainer>
        {(entities, state, actions) => (
          <OpportunityTabs entities={entities}>
            {({ tabName, tabNames }) => {
              return (
                <TabContext value={tabName}>
                  <TabPanel value={tabNames['dashboard']}>
                    <OpportunityDashboardView
                      entities={{
                        opportunity: entities.opportunity,
                        activity: entities.activity,
                        availableActorGroupNames: entities.availableActorGroupNames,
                        existingAspectNames: entities.existingAspectNames,
                        url: entities.url,
                        links: entities.links,
                        meme: entities.meme,
                        relations: entities.relations,
                        discussions: entities.discussions,
                      }}
                      state={{
                        loading: state.loading,
                        showInterestModal: entities.showInterestModal,
                        showActorGroupModal: entities.showActorGroupModal,
                        error: state.error,
                      }}
                      actions={{
                        onInterestOpen: actions.onInterestOpen,
                        onInterestClose: actions.onInterestClose,
                        onAddActorGroupOpen: actions.onAddActorGroupOpen,
                        onAddActorGroupClose: actions.onAddActorGroupClose,
                      }}
                      options={{
                        editAspect: entities.permissions.editAspect,
                        editActorGroup: entities.permissions.editActorGroup,
                        editActors: entities.permissions.editActors,
                        removeRelations: entities.permissions.removeRelations,
                        isMemberOfOpportunity: entities.permissions.isMemberOfOpportunity,
                        isNoRelations: entities.permissions.isNoRelations,
                        isAspectAddAllowed: entities.permissions.isAspectAddAllowed,
                        isAuthenticated: entities.permissions.isAuthenticated,
                        communityReadAccess: entities.permissions.communityReadAccess,
                      }}
                    />
                  </TabPanel>
                  <TabPanel value={tabNames['context']}>
                    <OpportunityContextView
                      entities={{
                        opportunity: entities.opportunity,
                        availableActorGroupNames: entities.availableActorGroupNames,
                        existingAspectNames: entities.existingAspectNames,
                        meme: entities.meme,
                      }}
                      state={{
                        showActorGroupModal: entities.showActorGroupModal,
                        loading: state.loading,
                        error: state.error,
                      }}
                      actions={{
                        onAddActorGroupOpen: actions.onAddActorGroupOpen,
                        onAddActorGroupClose: actions.onAddActorGroupClose,
                        onMemeError: actions.onMemeError,
                      }}
                      options={{
                        editAspect: entities.permissions.editAspect,
                        editActorGroup: entities.permissions.editActorGroup,
                        editActors: entities.permissions.editActors,
                        removeRelations: entities.permissions.removeRelations,
                        isMemberOfOpportunity: entities.permissions.isMemberOfOpportunity,
                        isNoRelations: entities.permissions.isNoRelations,
                        isAspectAddAllowed: entities.permissions.isAspectAddAllowed,
                        isAuthenticated: entities.permissions.isAuthenticated,
                      }}
                    />
                  </TabPanel>
                  <TabPanel value={tabNames['projects']}>
                    <OpportunityProjectsView
                      entities={{
                        opportunityProjects: entities.opportunityProjects,
                      }}
                      state={{}}
                      actions={{}}
                      options={{}}
                    />
                  </TabPanel>
                  <TabPanel value={tabNames['community']}>
                    <OpportunityCommunityPage paths={paths} />
                  </TabPanel>
                  <TabPanel value={tabNames['discussions']}>
                    <Switch>
                      <RestrictedRoute path={`${path}/community/discussions`}>
                        <DiscussionsRoute paths={paths} />
                      </RestrictedRoute>
                    </Switch>
                  </TabPanel>
                  <TabPanel value={tabNames['canvases']}>Comming soon</TabPanel>
                </TabContext>
              );
            }}
          </OpportunityTabs>
        )}
      </OpportunityPageContainer>
    </DiscussionsProvider>
  );
};

export { OpportunityPage };
