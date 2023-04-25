import React, { ReactElement, ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import References from '../../../../shared/components/References/References';
import { DashboardTopCalloutFragment, Reference } from '../../../../../core/apollo/generated/graphql-schema';
import { buildCalloutUrl, buildJourneyUrl, JourneyLocation } from '../../../../../common/utils/urlBuilders';
import EntityDashboardContributorsSection from '../../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../../community/community/EntityDashboardContributorsSection/Types';
import DashboardUpdatesSection from '../../../../shared/components/DashboardSections/DashboardUpdatesSection';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import withOptionalCount from '../../../../shared/utils/withOptionalCount';
import EntityDashboardLeadsSection from '../../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import { ActivityComponent, ActivityLogResultType } from '../../../../shared/components/ActivityLog';
import ShareButton from '../../../../shared/components/ShareDialog/ShareButton';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../../core/ui/content/SeeMore';
import JourneyDashboardVision from './JourneyDashboardVision';
import { CoreEntityIdTypes } from '../../../../shared/types/CoreEntityIds';
import { Identifiable } from '../../../../shared/types/Identifiable';
import { JourneyTypeName } from '../../../JourneyTypeName';
import TopCalloutDetails from '../../../../collaboration/callout/TopCallout/TopCalloutDetails';
import getChildJourneyRoute from '../../utils/getChildJourneyRoute';
import ScrollableCardsLayout from '../../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
import DashboardCalendarSection from '../../../../shared/components/DashboardSections/DashboardCalendarSection';
import { Caption } from '../../../../../core/ui/typography/components';
import ContactLeadsButton from '../../../../community/community/ContactLeadsButton/ContactLeadsButton';
import {
  DirectMessageDialog,
  MessageReceiverChipData,
} from '../../../../communication/messaging/DirectMessaging/DirectMessageDialog';

export interface JourneyDashboardViewProps<ChildEntity extends Identifiable>
  extends EntityDashboardContributors,
    EntityDashboardLeads,
    Partial<CoreEntityIdTypes> {
  vision?: string;
  communityId?: string;
  organization?: unknown;
  references: Reference[] | undefined;
  community?: unknown;
  communityReadAccess: boolean;
  timelineReadAccess?: boolean;
  activities: ActivityLogResultType[] | undefined;
  activityLoading: boolean;
  childEntities?: ChildEntity[];
  entityReadAccess: boolean;
  readUsersAccess: boolean;
  childEntitiesCount?: number;
  renderChildEntityCard?: (childEntity: ChildEntity) => ReactElement;
  journeyTypeName: JourneyTypeName;
  childEntityTitle?: string;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  childrenLeft?: ReactNode;
  childrenRight?: ReactNode;
}

const JourneyDashboardView = <ChildEntity extends Identifiable>({
  vision = '',
  hubNameId,
  challengeNameId,
  opportunityNameId,
  communityId = '',
  childEntitiesCount,
  references,
  communityReadAccess = false,
  timelineReadAccess = false,
  entityReadAccess,
  readUsersAccess,
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
  leadOrganizations,
  leadUsers,
  activities,
  activityLoading,
  childEntities = [],
  renderChildEntityCard,
  journeyTypeName,
  childEntityTitle,
  topCallouts,
  sendMessageToCommunityLeads,
  childrenLeft,
  childrenRight,
}: JourneyDashboardViewProps<ChildEntity>) => {
  const { t } = useTranslation();
  const [isOpenContactLeadUsersDialog, setIsOpenContactLeadUsersDialog] = useState(false);
  const openContactLeadsDialog = () => {
    setIsOpenContactLeadUsersDialog(true);
  };
  const closeContactLeadsDialog = () => {
    setIsOpenContactLeadUsersDialog(false);
  };

  const journeyLocation: JourneyLocation | undefined =
    typeof hubNameId === 'undefined'
      ? undefined
      : {
          hubNameId,
          challengeNameId,
          opportunityNameId,
        };

  const showActivities = activities || activityLoading;

  const isHub = journeyTypeName === 'hub';
  const leadOrganizationsHeader = isHub
    ? 'pages.hub.sections.dashboard.organization'
    : 'community.leading-organizations';
  const leadUsersHeader = isHub ? 'community.host' : 'community.leads';

  const hasTopCallouts = (topCallouts ?? []).length > 0;
  const messageReceivers = useMemo(
    () =>
      (leadUsers ?? []).map<MessageReceiverChipData>(user => ({
        id: user.id,
        title: user.profile.displayName,
        country: user.profile.location?.country,
        city: user.profile.location?.city,
        avatarUri: user.profile.visual?.uri,
      })),
    [leadUsers]
  );

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <JourneyDashboardVision vision={vision} journeyTypeName={journeyTypeName} />
        <ShareButton
          title={t('share-dialog.share-this', { entity: t(`common.${journeyTypeName}` as const) })}
          url={journeyLocation && buildJourneyUrl(journeyLocation)}
          entityTypeName={journeyTypeName}
        />
        {communityReadAccess && (
          <EntityDashboardLeadsSection
            usersHeader={t(leadUsersHeader)}
            organizationsHeader={t(leadOrganizationsHeader)}
            leadUsers={leadUsers}
            leadOrganizations={leadOrganizations}
          />
        )}
        {communityReadAccess && (
          <ContactLeadsButton onClick={openContactLeadsDialog}>
            {t('buttons.contact-leads', { contact: t(leadUsersHeader) })}
          </ContactLeadsButton>
        )}
        <DirectMessageDialog
          title={t('send-message-dialog.community-message-title', { contact: t(leadUsersHeader) })}
          open={isOpenContactLeadUsersDialog}
          onClose={closeContactLeadsDialog}
          onSendMessage={sendMessageToCommunityLeads}
          messageReceivers={messageReceivers}
        />
        {timelineReadAccess && <DashboardCalendarSection journeyLocation={journeyLocation} />}
        <PageContentBlock>
          <PageContentBlockHeader title={t('components.referenceSegment.title')} />
          <References references={references} />
          {/* TODO figure out the URL for references */}
          <SeeMore subject={t('common.references')} to={EntityPageSection.About} />
        </PageContentBlock>
        {communityReadAccess && <DashboardUpdatesSection entities={{ hubId: hubNameId, communityId }} />}
        {communityReadAccess && (
          <EntityDashboardContributorsSection
            memberUsers={memberUsers}
            memberUsersCount={memberUsersCount}
            memberOrganizations={memberOrganizations}
            memberOrganizationsCount={memberOrganizationsCount}
          />
        )}
        {childrenLeft}
      </PageContentColumn>

      <PageContentColumn columns={8}>
        {hasTopCallouts && (
          <PageContentBlock>
            <PageContentBlockHeader title={t('components.top-callouts.title')} />
            {topCallouts?.map(callout => (
              <TopCalloutDetails
                key={callout.id}
                title={callout.profile.displayName}
                description={callout.profile.description || ''}
                activity={callout.activity}
                type={callout.type}
                calloutUri={journeyLocation && buildCalloutUrl(callout.nameID, journeyLocation)}
              />
            ))}
          </PageContentBlock>
        )}
        <PageContentBlock>
          <PageContentBlockHeader title={t('components.activity-log-section.title')} />
          {readUsersAccess && entityReadAccess && showActivities && (
            <>
              <ActivityComponent activities={activities} journeyLocation={journeyLocation} />
              <SeeMore subject={t('common.contributions')} to={EntityPageSection.Contribute} />
            </>
          )}
          {!entityReadAccess && readUsersAccess && (
            <Caption>
              {t('components.activity-log-section.activity-join-error-message', {
                journeyType: t(`common.${journeyTypeName}` as const),
              })}
            </Caption>
          )}
          {!readUsersAccess && entityReadAccess && (
            <Caption>{t('components.activity-log-section.activity-sign-in-error-message')}</Caption>
          )}
          {!entityReadAccess && !readUsersAccess && (
            <Caption>
              {t('components.activity-log-section.activity-sign-in-and-join-error-message', {
                journeyType: t(`common.${journeyTypeName}` as const),
              })}
            </Caption>
          )}
        </PageContentBlock>
        {entityReadAccess && renderChildEntityCard && childEntityTitle && (
          <PageContentBlock>
            <PageContentBlockHeader title={withOptionalCount(childEntityTitle, childEntitiesCount)} />
            <ScrollableCardsLayout items={childEntities} deps={[hubNameId]}>
              {renderChildEntityCard}
            </ScrollableCardsLayout>
            <SeeMore subject={childEntityTitle} to={getChildJourneyRoute(journeyTypeName)} />
          </PageContentBlock>
        )}
        {childrenRight}
      </PageContentColumn>
    </PageContent>
  );
};

export default JourneyDashboardView;
