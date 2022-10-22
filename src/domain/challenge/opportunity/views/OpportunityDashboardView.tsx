import { ApolloError } from '@apollo/client';
import { Button, Grid } from '@mui/material';
import SchoolIcon from '@mui/material/SvgIcon/SvgIcon';
import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardSectionAspects from '../../../collaboration/aspect/DashboardSectionAspects/DashboardSectionAspects';
import { AspectCardAspect } from '../../../collaboration/aspect/AspectCard/AspectCard';
import References from '../../../../common/components/composite/common/References/References';
import InterestModal from '../../../../common/components/composite/entities/Hub/InterestModal';
import ContextSectionIcon from '../../../../common/components/composite/sections/ContextSectionIcon';
import DashboardColumn from '../../../../common/components/composite/sections/DashboardSection/DashboardColumn';
import DashboardSection from '../../../../common/components/composite/sections/DashboardSection/DashboardSection';
import WrapperMarkdown from '../../../../common/components/core/WrapperMarkdown';
import { useHub, useChallenge } from '../../../../hooks';
import { Discussion } from '../../../communication/discussion/models/discussion';
import {
  OpportunityPageFragment,
  OpportunityPageRelationsFragment,
  Reference,
} from '../../../../models/graphql-schema';
import { ViewProps } from '../../../../models/view';
import { buildOpportunityUrl, buildCanvasUrl } from '../../../../common/utils/urlBuilders';
import { CanvasCard } from '../../../collaboration/callout/canvas/CanvasCallout';
import CanvasesDashboardPreview from '../../../collaboration/canvas/CanvasesDashboardPreview/CanvasesDashboardPreview';
import EntityDashboardContributorsSection from '../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import { EntityDashboardContributors } from '../../../community/community/EntityDashboardContributorsSection/Types';
import EntityDashboardLeadsSection from '../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import DashboardUpdatesSection from '../../../shared/components/DashboardSections/DashboardUpdatesSection';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import { useUserContext } from '../../../community/contributor/user';
import { useOpportunity } from '../hooks/useOpportunity';
import { ActivityLogResultType, ActivitySection } from '../../../shared/components/ActivityLog';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';

// TODO flat props
export interface OpportunityDashboardViewEntities {
  opportunity: OpportunityPageFragment;
  // activity: MetricsItem[];
  availableActorGroupNames: string[];
  existingAspectNames: string[];
  discussions: Discussion[];
  url: string;
  links: Reference[];
  meme?: Reference;
  relations: {
    incoming: OpportunityPageRelationsFragment[];
    outgoing: OpportunityPageRelationsFragment[];
  };
  aspects: AspectCardAspect[];
  aspectsCount: number | undefined;
  canvases: CanvasCard[];
  canvasesCount: number | undefined;
  references: Reference[] | undefined;
  activities: ActivityLogResultType[] | undefined;
}

export interface OpportunityDashboardViewActions {
  onInterestOpen: () => void;
  onInterestClose: () => void;
  onAddActorGroupOpen: () => void;
  onAddActorGroupClose: () => void;
}

export interface OpportunityDashboardViewState {
  loading: boolean;
  showInterestModal: boolean;
  showActorGroupModal: boolean;
  error?: ApolloError;
}

export interface OpportunityDashboardViewOptions {
  editAspect: boolean;
  editActorGroup: boolean;
  editActors: boolean;
  removeRelations: boolean;
  isMemberOfOpportunity: boolean;
  isNoRelations: boolean;
  isAuthenticated: boolean;
  communityReadAccess: boolean;
}

export interface OpportunityDashboardViewProps
  extends ViewProps<
    OpportunityDashboardViewEntities & EntityDashboardContributors,
    OpportunityDashboardViewActions,
    OpportunityDashboardViewState,
    OpportunityDashboardViewOptions
  > {}

const OpportunityDashboardView: FC<OpportunityDashboardViewProps> = ({ entities, state, options, actions }) => {
  const { t } = useTranslation();

  const { hubNameId } = useHub();
  const { challengeNameId } = useChallenge();
  const { hubId, opportunityId } = useOpportunity();

  const [, buildLinkToCanvas] = useBackToParentPage(
    buildOpportunityUrl(hubNameId, challengeNameId, entities.opportunity.nameID)
  );

  const buildCanvasLink = useCallback(
    (canvasNameId: string, calloutNameId: string) => {
      const url = buildCanvasUrl({
        hubNameId,
        challengeNameId,
        opportunityNameId: entities.opportunity.nameID,
        calloutNameId,
        canvasNameId,
      });
      return buildLinkToCanvas(url);
    },
    [hubNameId, challengeNameId, entities.opportunity, buildLinkToCanvas]
  );

  const { user: userMetadata } = useUserContext();

  const isNotMember = opportunityId && userMetadata ? !userMetadata.ofOpportunity(opportunityId) : true;

  const { opportunity, activities } = entities;
  const communityId = opportunity?.community?.id || '';
  const { communityReadAccess } = options;

  const { id, collaboration, context } = opportunity;
  const { id: collaborationId } = collaboration ?? {};
  const references = context?.references;

  const { loading } = state;

  return (
    <>
      <Grid container spacing={2}>
        <DashboardColumn>
          <DashboardGenericSection
            headerText={t('pages.opportunity.about-this-opportunity')}
            primaryAction={
              isNotMember && (
                <Button onClick={actions.onInterestOpen} variant="contained">
                  {t('pages.opportunity.sections.apply')}
                </Button>
              )
            }
          >
            <WrapperMarkdown children={opportunity?.context?.vision || ''} />
          </DashboardGenericSection>
          <ShareButton
            title={t('share-dialog.share-this', { entity: t('common.opportunity') })}
            url={buildOpportunityUrl(hubNameId, challengeNameId, entities.opportunity.nameID)}
            entityTypeName="opportunity"
          />
          {communityReadAccess && (
            <EntityDashboardLeadsSection
              usersHeader={t('community.leads')}
              organizationsHeader={t('community.leading-organizations')}
              leadUsers={opportunity?.community?.leadUsers}
              leadOrganizations={opportunity?.community?.leadOrganizations}
            />
          )}
          {communityReadAccess && (
            <>
              <DashboardUpdatesSection entities={{ hubId: hubId, communityId: communityId }} />
              {/* The discussions are not loaded, check OpportunityPageContainer if you try to enable them. */}
              {/* <SectionSpacer />
              <DashboardDiscussionsSection discussions={discussions} isMember={options.isMemberOfOpportunity} /> */}
            </>
          )}
          {communityReadAccess && (
            <EntityDashboardContributorsSection
              memberUsers={entities.memberUsers}
              memberUsersCount={entities.memberUsersCount}
              memberOrganizations={entities.memberOrganizations}
              memberOrganizationsCount={entities.memberOrganizationsCount}
            />
          )}
        </DashboardColumn>
        <DashboardColumn>
          <ActivitySection activities={activities} />
          {!!references && references.length > 0 && (
            <DashboardSection
              headerText={t('components.referenceSegment.title')}
              primaryAction={<ContextSectionIcon component={SchoolIcon} />}
              collapsible
            >
              <References references={references} />
            </DashboardSection>
          )}
          <DashboardSectionAspects
            aspects={entities.aspects}
            aspectsCount={entities.aspectsCount}
            hubNameId={hubNameId}
            challengeNameId={challengeNameId}
            opportunityNameId={opportunity.nameID}
          />
          <CanvasesDashboardPreview
            canvases={entities.canvases}
            canvasesCount={entities.canvasesCount}
            noItemsMessage={t('pages.canvas.no-canvases')}
            buildCanvasLink={buildCanvasLink}
            loading={loading}
          />
        </DashboardColumn>
      </Grid>
      <InterestModal
        onHide={actions.onInterestClose}
        show={state.showInterestModal}
        collaborationId={collaborationId}
        opportunityId={id}
      />
    </>
  );
};
export default OpportunityDashboardView;
