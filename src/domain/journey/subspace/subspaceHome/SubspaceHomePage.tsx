import React from 'react';
import SubspaceHomeView from './SubspaceHomeView';
import JourneyContributePageContainer from './JourneyContributePageContainer';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import { useTranslation } from 'react-i18next';
import { SubspacePageLayout } from '../../common/EntityPageLayout';
import JourneyDashboardWelcomeBlock from '../../common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import { CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';
import { DialogDef } from '../layout/DialogDefinition';
import { SubspaceDialog } from '../layout/SubspaceDialog';
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
import { InnovationFlowIcon } from '../../../collaboration/InnovationFlow/InnovationFlowIcon/InnovationFlowIcon';
import SubspaceDialogs from './dialogs/SubspaceDialogs';

interface SubspaceHomePageProps {
  dialog?: SubspaceDialog | undefined;
}

const SubspaceHomePage = ({ dialog }: SubspaceHomePageProps) => {
  const { t } = useTranslation();

  const { journeyId, journeyTypeName, journeyPath, loading } = useRouteResolver();

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  return (
    <JourneyContributePageContainer journeyId={journeyId} journeyTypeName={journeyTypeName}>
      {({ innovationFlow, callouts, subspace }) => (
        <SubspacePageLayout
          journeyId={journeyId}
          journeyPath={journeyPath}
          loading={loading}
          welcome={
            <JourneyDashboardWelcomeBlock
              vision={subspace?.context?.vision ?? ''}
              leadUsers={subspace?.community?.leadUsers}
              onContactLeadUser={receiver => sendMessage('user', receiver)}
              leadOrganizations={subspace?.community?.leadOrganizations}
              onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
              journeyTypeName="subspace"
              member={subspace?.community?.myMembershipStatus === CommunityMembershipStatus.Member}
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
                dialogType={SubspaceDialog.Events}
                label={t(`spaceDialog.${SubspaceDialog.Events}` as const)}
                icon={CalendarMonthOutlined}
              />
              <DialogDef
                dialogType={SubspaceDialog.Share}
                label={t(`spaceDialog.${SubspaceDialog.Share}` as const)}
                icon={ShareOutlined}
              />
              <DialogDef
                dialogType={SubspaceDialog.ManageFlow}
                label={t(`spaceDialog.${SubspaceDialog.ManageFlow}` as const)}
                icon={InnovationFlowIcon}
              />
              <DialogDef
                dialogType={SubspaceDialog.Settings}
                label={t(`spaceDialog.${SubspaceDialog.Settings}` as const)}
                icon={SettingsOutlined}
              />
            </>
          }
          profile={subspace?.profile}
        >
          <SubspaceHomeView
            journeyTypeName={journeyTypeName}
            {...innovationFlow}
            {...callouts}
            collaborationId={subspace?.collaboration.id}
          />
          {directMessageDialog}
          <SubspaceDialogs dialog={dialog} callouts={callouts?.callouts ?? []} journeyId={journeyId} />
        </SubspacePageLayout>
      )}
    </JourneyContributePageContainer>
  );
};

export default SubspaceHomePage;
