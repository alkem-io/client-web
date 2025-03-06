import { useState } from 'react';
import SubspaceHomeView from './SubspaceHomeView';
import SubspaceHomeContainer from './SubspaceHomeContainer';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import { useTranslation } from 'react-i18next';
import { SubspacePageLayout } from '@/domain/journey/common/EntityPageLayout';
import JourneyDashboardWelcomeBlock from '@/domain/journey/common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import { AuthorizationPrivilege, CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';
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

  return (
    <SubspaceHomeContainer spaceId={spaceId}>
      {({ innovationFlow, calloutsSetProvided: callouts, subspace, communityReadAccess, communityId, roleSet }) => {
        const { collaboration, community, about, level } = subspace ?? {};

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
                  description={subspace?.about.profile.description ?? ''}
                  leadUsers={roleSet.leadUsers}
                  onContactLeadUser={receiver => sendMessage('user', receiver)}
                  leadOrganizations={roleSet.leadOrganizations}
                  onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
                  level={spaceLevel}
                  member={community?.roleSet?.myMembershipStatus === CommunityMembershipStatus.Member}
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
                  {innovationFlow.canEditInnovationFlow && (
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
                    level={level}
                    dashboardNavigation={dashboardNavigation.dashboardNavigation}
                    onCreateSubspace={openCreateSubspace}
                    onCurrentItemNotFound={dashboardNavigation.refetch}
                  />
                  {communityReadAccess && communityId && (
                    <DashboardUpdatesSection
                      communityId={communityId}
                      shareUrl={buildUpdatesUrl(about?.profile?.url ?? '')}
                    />
                  )}
                </>
              }
            >
              <SubspaceHomeView
                spaceLevel={level}
                collaborationId={collaboration?.id}
                calloutsSetId={collaboration?.calloutsSet.id}
                templatesSetId={subspace?.templatesManager?.templatesSet?.id}
                {...innovationFlow}
                {...callouts}
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
              callouts={callouts}
              journeyId={spaceId}
              journeyUrl={about?.profile?.url}
              dashboardNavigation={dashboardNavigation}
              communityId={community?.id}
              collaborationId={collaboration?.id}
              calendarEventId={calendarEventId}
            />
          </>
        );
      }}
    </SubspaceHomeContainer>
  );
};

export default SubspaceHomePage;
