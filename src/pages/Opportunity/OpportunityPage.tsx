import React, { FC } from 'react';
import { useUpdateNavigation } from '../../hooks';
import { PageProps } from '../common';
import { OpportunityPageContainer } from '../../containers';
import { OpportunityView } from '../../views';

interface OpportunityPageProps extends PageProps {}

const OpportunityPage: FC<OpportunityPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <OpportunityPageContainer>
      {(entities, state, actions) => (
        <OpportunityView
          entities={{
            opportunity: entities.opportunity,
            activity: entities.activity,
            opportunityProjects: entities.opportunityProjects,
            availableActorGroupNames: entities.availableActorGroupNames,
            existingAspectNames: entities.existingAspectNames,
            url: entities.url,
            links: entities.links,
            meme: entities.meme,
            relations: entities.relations,
          }}
          state={{
            loading: state.loading,
            showInterestModal: entities.showInterestModal,
            showActorGroupModal: entities.showActorGroupModal,
            error: state.error,
          }}
          actions={{
            onMemeError: actions.onMemeError,
            onInterestOpen: actions.onInterestOpen,
            onInterestClose: actions.onInterestClose,
            onAddActorGroupOpen: actions.onAddActorGroupOpen,
            onAddActorGroupClose: actions.onAddActorGroupClose,
          }}
          options={{
            canEdit: entities.permissions.canEdit,
            projectWrite: entities.permissions.projectWrite,
            editAspect: entities.permissions.editAspect,
            editActorGroup: entities.permissions.editActorGroup,
            editActors: entities.permissions.editActors,
            removeRelations: entities.permissions.removeRelations,
            isMemberOfOpportunity: entities.permissions.isMemberOfOpportunity,
            isNoRelations: entities.permissions.isNoRelations,
            isAspectAddAllowed: entities.permissions.isAspectAddAllowed,
            isAuthenticated: entities.permissions.isAuthenticated,
            hideMeme: entities.hideMeme,
          }}
        />
      )}
    </OpportunityPageContainer>
  );
};

export { OpportunityPage };
