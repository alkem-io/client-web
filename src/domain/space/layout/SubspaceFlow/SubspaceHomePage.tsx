import { useState } from 'react';
import SubspaceHomeView from './SubspaceHomeView';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import { useTranslation } from 'react-i18next';
import { SubspacePageLayout } from '@/domain/journey/common/EntityPageLayout';
import JourneyDashboardWelcomeBlock from '@/domain/journey/common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  RoleName,
  RoleSetContributorType,
} from '@/core/apollo/generated/graphql-schema';
import { DialogDef } from '../../../journey/subspace/layout/DialogDefinition';
import { SubspaceDialog } from '../../../journey/subspace/layout/SubspaceDialog';
import {
  AccountTreeOutlined,
  CalendarMonthOutlined,
  GroupsOutlined,
  HistoryOutlined,
  InfoOutlined,
  ListOutlined,
  SegmentOutlined,
  SettingsOutlined,
  ShareOutlined,
} from '@mui/icons-material';
import { InnovationFlowIcon } from '@/domain/collaboration/InnovationFlow/InnovationFlowIcon/InnovationFlowIcon';
import SubspaceDialogs from '../../../journey/subspace/subspaceHome/dialogs/SubspaceDialogs';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useSpaceDashboardNavigation from '@/domain/journey/space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import DashboardNavigation, {
  DashboardNavigationProps,
} from '@/domain/journey/dashboardNavigation/DashboardNavigation';
import { useConsumeAction } from '../../../journey/subspace/layout/SubspacePageLayout';
import { useColumns } from '@/core/ui/grid/GridContext';
import CreateJourney from '../../../journey/subspace/subspaceHome/dialogs/CreateJourney';
import DashboardUpdatesSection from '@/domain/shared/components/DashboardSections/DashboardUpdatesSection';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import useInnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';

const Outline = (props: DashboardNavigationProps) => {
  useConsumeAction(SubspaceDialog.Outline);
  const columns = useColumns();
  return <DashboardNavigation compact={columns === 0} {...props} />;
};

const SubspaceHomePage = ({ dialog }: { dialog?: SubspaceDialog }) => {
  const { t } = useTranslation();
  const { spaceId, spaceLevel, journeyPath, parentSpaceId, levelZeroSpaceId, calendarEventId, loading } =
    useUrlResolver();

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const dashboardNavigation = useSpaceDashboardNavigation({
    spaceId,
    skip: !spaceId,
  });

  const [createSpaceState, setCreateSpaceState] = useState<
    | {
        isDialogVisible: true;
        parentSpaceId: string;
      }
    | {
        isDialogVisible: false;
        parentSpaceId?: never;
      }
  >({
    isDialogVisible: false,
  });

  const openCreateSubspace = ({ id }) => {
    setCreateSpaceState({
      isDialogVisible: true,
      parentSpaceId: id,
    });
  };

  const onCreateJourneyClose = () => {
    setCreateSpaceState({
      isDialogVisible: false,
    });
  };

  const { data: subspacePageData } = useSubspacePageQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const subspace = subspacePageData?.lookup.space;
  const about = subspace?.about;
  const membership = about?.membership;
  const roleSetID = membership?.roleSetID;
  const communityId = membership?.communityID;
  const collaboration = subspace?.collaboration;
  const calloutsSetId = collaboration?.calloutsSet.id;
  const collaborationId = collaboration?.id;

  const innovationFlowProvided = useInnovationFlowStates({ collaborationId });

  const { organizations: leadOrganizations, users: leadUsers } = useRoleSetManager({
    roleSetId: roleSetID,
    relevantRoles: [RoleName.Lead],
    contributorTypes: [RoleSetContributorType.User, RoleSetContributorType.Organization],
    fetchContributors: true,
  });

  // TODO: THIS needs to be removed
  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets: [],
    canSaveAsTemplate: false,
    entitledToSaveAsTemplate: false,
    includeClassification: true,
  });

  return (
    <>
      <SubspacePageLayout
        journeyId={spaceId}
        journeyPath={journeyPath}
        spaceLevel={spaceLevel}
        spaceUrl={about?.profile?.url}
        levelZeroSpaceId={levelZeroSpaceId}
        parentSpaceId={parentSpaceId}
        loading={loading}
        welcome={
          <JourneyDashboardWelcomeBlock
            description={about?.profile.description ?? ''}
            leadUsers={leadUsers}
            onContactLeadUser={receiver => sendMessage('user', receiver)}
            leadOrganizations={leadOrganizations}
            onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
            level={spaceLevel}
            member={about?.membership?.myMembershipStatus === CommunityMembershipStatus.Member}
          />
        }
        actions={
          <>
            <DialogDef
              dialogType={SubspaceDialog.About}
              label={t(`spaceDialog.${SubspaceDialog.About}` as const)}
              icon={InfoOutlined}
            />
            <DialogDef
              dialogType={SubspaceDialog.Outline}
              label={t(`spaceDialog.${SubspaceDialog.Outline}` as const)}
              icon={AccountTreeOutlined}
            />
            <DialogDef
              dialogType={SubspaceDialog.Index}
              label={t(`spaceDialog.${SubspaceDialog.Index}` as const)}
              icon={ListOutlined}
            />
            <DialogDef
              dialogType={SubspaceDialog.Subspaces}
              label={t(`spaceDialog.${SubspaceDialog.Subspaces}` as const)}
              icon={SegmentOutlined}
            />
            <DialogDef
              dialogType={SubspaceDialog.Contributors}
              label={t(`spaceDialog.${SubspaceDialog.Contributors}` as const)}
              icon={GroupsOutlined}
            />
            <DialogDef
              dialogType={SubspaceDialog.Activity}
              label={t(`spaceDialog.${SubspaceDialog.Activity}` as const)}
              icon={HistoryOutlined}
            />
            <DialogDef
              dialogType={SubspaceDialog.Timeline}
              label={t('spaceDialog.events')}
              icon={CalendarMonthOutlined}
            />
            <DialogDef
              dialogType={SubspaceDialog.Share}
              label={t(`spaceDialog.${SubspaceDialog.Share}` as const)}
              icon={ShareOutlined}
            />
            {innovationFlowProvided.canEditInnovationFlow && (
              <DialogDef
                dialogType={SubspaceDialog.ManageFlow}
                label={t(`spaceDialog.${SubspaceDialog.ManageFlow}` as const)}
                icon={InnovationFlowIcon}
              />
            )}
            {subspace?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) && (
              <DialogDef
                dialogType={SubspaceDialog.Settings}
                label={t(`spaceDialog.${SubspaceDialog.Settings}` as const)}
                icon={SettingsOutlined}
              />
            )}
          </>
        }
        infoColumnChildren={
          <>
            <Outline
              currentItemId={spaceId}
              level={spaceLevel}
              dashboardNavigation={dashboardNavigation.dashboardNavigation}
              onCreateSubspace={openCreateSubspace}
              onCurrentItemNotFound={dashboardNavigation.refetch}
            />
            <DashboardUpdatesSection communityId={communityId} shareUrl={buildUpdatesUrl(about?.profile?.url ?? '')} />
          </>
        }
      >
        <SubspaceHomeView
          spaceLevel={subspace?.level}
          collaborationId={collaboration?.id}
          templatesSetId={subspace?.templatesManager?.templatesSet?.id}
          calloutsSetId={calloutsSetId}
          innovationFlowStates={innovationFlowProvided.innovationFlowStates}
          refetchCallout={calloutsSetProvided.refetchCallout}
          onCalloutsSortOrderUpdate={calloutsSetProvided.onCalloutsSortOrderUpdate}
          canCreateCallout={calloutsSetProvided.canCreateCallout}
          currentInnovationFlowState={innovationFlowProvided.currentInnovationFlowState}
          loading={loading}
        />
      </SubspacePageLayout>
      {directMessageDialog}
      <CreateJourney
        isVisible={createSpaceState.isDialogVisible}
        onClose={onCreateJourneyClose}
        parentSpaceId={createSpaceState.parentSpaceId}
      />
      <SubspaceDialogs
        parentSpaceId={parentSpaceId}
        dialogOpen={dialog}
        calloutsSetProvided={calloutsSetProvided}
        journeyId={spaceId}
        journeyUrl={about?.profile?.url}
        dashboardNavigation={dashboardNavigation}
        communityId={about?.membership.communityID}
        collaborationId={collaboration?.id}
        calendarEventId={calendarEventId}
      />
    </>
  );
};

export default SubspaceHomePage;
