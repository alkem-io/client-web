import React, { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalloutGroupName,
  CalloutsQueryVariables,
  Reference,
} from '../../../../../core/apollo/generated/graphql-schema';
import EntityDashboardContributorsSection from '../../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../../community/community/EntityDashboardContributorsSection/Types';
import DashboardUpdatesSection from '../../../../shared/components/DashboardSections/DashboardUpdatesSection';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import ShareButton from '../../../../shared/components/ShareDialog/ShareButton';
import PageContent from '../../../../../core/ui/content/PageContent';
import SeeMore from '../../../../../core/ui/content/SeeMore';
import { JourneyTypeName } from '../../../JourneyTypeName';
import DashboardCalendarSection from '../../../../shared/components/DashboardSections/DashboardCalendarSection';
import ContactLeadsButton from '../../../../community/community/ContactLeadsButton/ContactLeadsButton';
import {
  DirectMessageDialog,
  MessageReceiverChipData,
} from '../../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import CalloutsGroupView from '../../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '../../../../collaboration/callout/useCallouts/useCallouts';
import FullWidthButton from '../../../../../core/ui/button/FullWidthButton';
import { InfoOutlined } from '@mui/icons-material';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import InfoColumn from '../../../../../core/ui/content/InfoColumn';
import ContentColumn from '../../../../../core/ui/content/ContentColumn';

export interface JourneyDashboardViewProps
  extends EntityDashboardContributors,
    Omit<EntityDashboardLeads, 'leadOrganizations'> {
  journeyId: string | undefined;
  journeyUrl: string | undefined;
  welcome?: ReactNode;
  ribbon?: ReactNode;
  communityId?: string;
  organization?: unknown;
  references: Reference[] | undefined;
  community?: unknown;
  communityReadAccess: boolean;
  timelineReadAccess?: boolean;
  entityReadAccess: boolean;
  readUsersAccess: boolean;
  journeyTypeName: JourneyTypeName;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  shareUpdatesUrl: string;
  callouts: {
    groupedCallouts: Record<CalloutGroupName, TypedCallout[] | undefined>;
    canCreateCallout: boolean;
    calloutNames: string[];
    loading: boolean;
    refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
    refetchCallout: (calloutId: string) => void;
    onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  };
}

const JourneyDashboardView = ({
  welcome,
  ribbon,
  journeyId,
  journeyUrl,
  communityId = '',
  callouts,
  communityReadAccess = false,
  timelineReadAccess = false,
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
  leadUsers,
  journeyTypeName,
  sendMessageToCommunityLeads,
  shareUpdatesUrl,
}: JourneyDashboardViewProps) => {
  const { t } = useTranslation();
  const [isOpenContactLeadUsersDialog, setIsOpenContactLeadUsersDialog] = useState(false);
  const openContactLeadsDialog = () => {
    setIsOpenContactLeadUsersDialog(true);
  };
  const closeContactLeadsDialog = () => {
    setIsOpenContactLeadUsersDialog(false);
  };

  const isSpace = journeyTypeName === 'space';

  const leadUsersHeader = isSpace ? 'community.host' : 'community.leads';

  const contactLeadsMessageReceivers = useMemo(
    () =>
      (leadUsers ?? []).map<MessageReceiverChipData>(user => ({
        id: user.id,
        displayName: user.profile.displayName,
        country: user.profile.location?.country,
        city: user.profile.location?.city,
        avatarUri: user.profile.avatar?.uri,
      })),
    [leadUsers]
  );

  const translatedJourneyTypeName = t(`common.${journeyTypeName}` as const);

  return (
    <PageContent>
      {ribbon}
      <InfoColumn>
        {welcome}
        <FullWidthButton
          startIcon={<InfoOutlined />}
          component={RouterLink}
          to={EntityPageSection.About}
          variant="contained"
        >
          {t('common.aboutThis', { entity: translatedJourneyTypeName })}
        </FullWidthButton>
        <ShareButton
          title={t('share-dialog.share-this', { entity: t(`common.${journeyTypeName}` as const) })}
          url={journeyUrl}
          entityTypeName={journeyTypeName}
        />
        {communityReadAccess && contactLeadsMessageReceivers.length > 0 && (
          <ContactLeadsButton onClick={openContactLeadsDialog}>
            {t('buttons.contact-leads', { contact: t(leadUsersHeader) })}
          </ContactLeadsButton>
        )}
        <DirectMessageDialog
          title={t('send-message-dialog.community-message-title', { contact: t(leadUsersHeader) })}
          open={isOpenContactLeadUsersDialog}
          onClose={closeContactLeadsDialog}
          onSendMessage={sendMessageToCommunityLeads}
          messageReceivers={contactLeadsMessageReceivers}
        />
        {timelineReadAccess && <DashboardCalendarSection journeyId={journeyId} journeyTypeName={journeyTypeName} />}
        {communityReadAccess && <DashboardUpdatesSection communityId={communityId} shareUrl={shareUpdatesUrl} />}
        {communityReadAccess && (
          <EntityDashboardContributorsSection
            memberUsers={memberUsers}
            memberUsersCount={memberUsersCount}
            memberOrganizations={memberOrganizations}
            memberOrganizationsCount={memberOrganizationsCount}
          >
            <SeeMore subject={t('common.contributors')} to={`${EntityPageSection.Dashboard}/contributors`} />
          </EntityDashboardContributorsSection>
        )}
      </InfoColumn>

      <ContentColumn>
        <CalloutsGroupView
          journeyId={journeyId}
          callouts={callouts.groupedCallouts[CalloutGroupName.Home]}
          canCreateCallout={callouts.canCreateCallout}
          loading={callouts.loading}
          journeyTypeName={journeyTypeName}
          calloutNames={callouts.calloutNames}
          onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
          onCalloutUpdate={callouts.refetchCallout}
          groupName={CalloutGroupName.Home}
        />
      </ContentColumn>
    </PageContent>
  );
};

export default JourneyDashboardView;
