import React, { ReactElement, ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import References from '../../../shared/components/References/References';
import { DashboardTopCalloutFragment, Reference } from '../../../../core/apollo/generated/graphql-schema';
import { buildCalloutUrl, buildJourneyUrl, JourneyLocation } from '../../../../common/utils/urlBuilders';
import EntityDashboardContributorsSection from '../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../community/community/EntityDashboardContributorsSection/Types';
import DashboardUpdatesSection from '../../../shared/components/DashboardSections/DashboardUpdatesSection';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import withOptionalCount from '../../../shared/utils/withOptionalCount';
import EntityDashboardLeadsSection from '../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import { ActivityComponent, ActivityLogResultType } from '../../../shared/components/ActivityLog';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../core/ui/content/SeeMore';
import JourneyDashboardVision from '../../common/tabs/Dashboard/JourneyDashboardVision';
import { CoreEntityIdTypes } from '../../../shared/types/CoreEntityIds';
import { Identifiable } from '../../../shared/types/Identifiable';
import { JourneyTypeName } from '../../JourneyTypeName';
import TopCalloutDetails from '../../../collaboration/callout/TopCallout/TopCalloutDetails';
import { RecommendationIcon } from '../../../shared/components/References/icons/RecommendationIcon';
import getChildJourneyRoute from '../../common/utils/getChildJourneyRoute';
import ScrollableCardsLayout from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
import DashboardCalendarSection from '../../../shared/components/DashboardSections/DashboardCalendarSection';
import { Caption } from '../../../../core/ui/typography/components';
import ContactLeadsButton from '../../../community/community/ContactLeadsButton/ContactLeadsButton';
import {
  DirectMessageDialog,
  MessageReceiverChipData,
} from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import ApplicationButton from '../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import { Button, ButtonProps, IconButton, Theme } from '@mui/material';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import JourneyAboutDialog from '../../common/JourneyAboutDialog/JourneyAboutDialog';
import { Metric } from '../../../platform/metrics/utils/getMetricCount';
import { Close } from '@mui/icons-material';

export interface JourneyDashboardViewProps<ChildEntity extends Identifiable>
  extends EntityDashboardContributors,
    EntityDashboardLeads,
    Partial<CoreEntityIdTypes> {
  displayName: ReactNode;
  tagline: ReactNode;
  metrics: Metric[] | undefined;
  description: string | undefined;
  who: string | undefined;
  impact: string | undefined;

  vision?: string;
  communityId?: string;
  organization?: unknown;
  references: Reference[] | undefined;
  recommendations: Reference[] | undefined;
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
  loading: boolean;
}

const FullWidthButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  sx,
  ...props
}: ButtonProps<D, P>) => {
  return <Button {...props} sx={{ ...sx, width: '100%' }} />;
};

const JourneyDashboardView = <ChildEntity extends Identifiable>({
  vision = '',
  displayName,
  tagline,
  metrics,
  description,
  who,
  impact,
  loading,
  hubNameId,
  challengeNameId,
  opportunityNameId,
  communityId = '',
  childEntitiesCount,
  references,
  recommendations,
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

  const validRecommendations = recommendations?.filter(rec => rec.uri) || [];
  const hasRecommendations = validRecommendations.length > 0;
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

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

  return (
    <>
      <PageContent>
        <ApplicationButtonContainer>
          {({ applicationButtonProps }, { loading }) => {
            if (loading || applicationButtonProps.isMember) {
              return null;
            }

            return (
              <PageContentColumn columns={12}>
                <ApplicationButton
                  {...applicationButtonProps}
                  loading={loading}
                  component={FullWidthButton}
                  extended={hasExtendedApplicationButton}
                />
              </PageContentColumn>
            );
          }}
        </ApplicationButtonContainer>
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
          {hasRecommendations && (
            <PageContentBlock halfWidth>
              <PageContentBlockHeader title={t('pages.generic.sections.recommendations.title')} />
              <References references={validRecommendations} icon={RecommendationIcon} />
            </PageContentBlock>
          )}
          {hasTopCallouts && (
            <PageContentBlock halfWidth={hasRecommendations}>
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
      <JourneyAboutDialog
        open={isAboutDialogOpen}
        journeyTypeName="hub"
        displayName={displayName}
        tagline={tagline}
        sendMessageToCommunityLeads={sendMessageToCommunityLeads}
        metrics={metrics}
        description={vision}
        background={description}
        who={who}
        impact={impact}
        loading={loading}
        leadUsers={leadUsers}
        leadOrganizations={leadOrganizations}
        endButton={
          <IconButton onClick={() => setIsAboutDialogOpen(false)}>
            <Close />
          </IconButton>
        }
      />
    </>
  );
};

export default JourneyDashboardView;
