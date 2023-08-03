import React, { ReactElement, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AssociatedOrganizationDetailsFragment,
  DashboardLeadUserFragment,
  DashboardTopCalloutFragment,
  Reference,
  SpaceVisibility,
  SpaceWelcomeBlockContributorProfileFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import {
  buildCalloutUrl,
  buildOrganizationUrl,
  buildUserProfileUrl,
  JourneyLocation,
} from '../../../../common/utils/urlBuilders';
import DashboardUpdatesSection from '../../../shared/components/DashboardSections/DashboardUpdatesSection';
import withOptionalCount from '../../../shared/utils/withOptionalCount';
import { ActivityComponent, ActivityLogResultType } from '../../../shared/components/ActivityLog';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { CoreEntityIdTypes } from '../../../shared/types/CoreEntityIds';
import { Identifiable } from '../../../shared/types/Identifiable';
import { JourneyTypeName } from '../../JourneyTypeName';
import TopCalloutDetails from '../../../collaboration/callout/TopCallout/TopCalloutDetails';
import getChildJourneyRoute from '../../common/utils/getChildJourneyRoute';
import ScrollableCardsLayout from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
import DashboardCalendarSection from '../../../shared/components/DashboardSections/DashboardCalendarSection';
import { Caption } from '../../../../core/ui/typography/components';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import ApplicationButton from '../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import { IconButton, Theme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import JourneyAboutDialog from '../../common/JourneyAboutDialog/JourneyAboutDialog';
import { Metric } from '../../../platform/metrics/utils/getMetricCount';
import { Close, InfoOutlined } from '@mui/icons-material';
import OverflowGradient from '../../../../core/ui/overflow/OverflowGradient';
import { gutters } from '../../../../core/ui/grid/utils';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import Gutters from '../../../../core/ui/grid/Gutters';
import ContributorCardHorizontal from '../../../../core/ui/card/ContributorCardHorizontal';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import DashboardMemberIcon from '../../../community/membership/DashboardMemberIcon/DashboardMemberIcon';
import { DashboardNavigationItem } from '../SpaceDashboardNavigation/useSpaceDashboardNavigation';
import DashboardNavigation from '../SpaceDashboardNavigation/DashboardNavigation';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import FullWidthButton from '../../../../core/ui/button/FullWidthButton';

interface SpaceWelcomeBlockContributor {
  profile: SpaceWelcomeBlockContributorProfileFragment;
}

interface SpaceDashboardViewProps<ChildEntity extends Identifiable> extends Partial<CoreEntityIdTypes> {
  displayName: ReactNode;
  tagline: ReactNode;
  metrics: Metric[] | undefined;
  description: string | undefined;
  dashboardNavigation: DashboardNavigationItem[] | undefined;
  dashboardNavigationLoading: boolean;
  who: string | undefined;
  impact: string | undefined;
  spaceVisibility?: SpaceVisibility;
  vision?: string;
  communityId?: string;
  organization?: unknown;
  references: Reference[] | undefined;
  hostOrganizations: (SpaceWelcomeBlockContributor & AssociatedOrganizationDetailsFragment)[] | undefined;
  leadOrganizations: (SpaceWelcomeBlockContributor & AssociatedOrganizationDetailsFragment)[] | undefined;
  leadUsers: (SpaceWelcomeBlockContributor & DashboardLeadUserFragment)[] | undefined;
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
  recommendations?: ReactNode;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  childrenLeft?: ReactNode;
  childrenRight?: ReactNode;
  loading: boolean;
}

const SpaceDashboardView = <ChildEntity extends Identifiable>({
  vision = '',
  displayName,
  tagline,
  metrics,
  description,
  dashboardNavigation,
  dashboardNavigationLoading,
  who,
  impact,
  spaceVisibility,
  loading,
  spaceNameId,
  challengeNameId,
  opportunityNameId,
  communityId = '',
  childEntitiesCount,
  references,
  communityReadAccess = false,
  timelineReadAccess = false,
  entityReadAccess,
  readUsersAccess,
  hostOrganizations,
  leadOrganizations,
  leadUsers,
  activities,
  activityLoading,
  childEntities = [],
  renderChildEntityCard,
  journeyTypeName,
  childEntityTitle,
  recommendations,
  topCallouts,
  sendMessageToCommunityLeads,
  childrenLeft,
  childrenRight,
}: SpaceDashboardViewProps<ChildEntity>) => {
  const { t } = useTranslation();

  const journeyLocation: JourneyLocation | undefined =
    typeof spaceNameId === 'undefined'
      ? undefined
      : {
          spaceNameId,
          challengeNameId,
          opportunityNameId,
        };

  const showActivities = activities || activityLoading;

  const hasTopCallouts = (topCallouts ?? []).length > 0;

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

  const translatedJourneyTypeName = t(`common.${journeyTypeName}` as const);

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  return (
    <>
      {directMessageDialog}
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
          <PageContentBlock accent>
            <ApplicationButtonContainer>
              {({ applicationButtonProps }) => (
                <PageContentBlockHeader
                  title={`${t('common.welcome')}!`}
                  actions={applicationButtonProps.isMember && <DashboardMemberIcon journeyTypeName={journeyTypeName} />}
                />
              )}
            </ApplicationButtonContainer>
            <OverflowGradient maxHeight={gutters(11)}>
              <WrapperMarkdown>{vision}</WrapperMarkdown>
            </OverflowGradient>
            <Gutters row disablePadding>
              {leadUsers?.slice(0, 2).map(user => (
                <ContributorCardHorizontal
                  key={user.id}
                  profile={user.profile}
                  url={buildUserProfileUrl(user.nameID)}
                  onContact={() => {
                    sendMessage('user', {
                      id: user.id,
                      displayName: user.profile.displayName,
                      avatarUri: user.profile.visual?.uri,
                      country: user.profile.location?.country,
                      city: user.profile.location?.city,
                    });
                  }}
                />
              ))}
            </Gutters>
            <Gutters row disablePadding>
              {hostOrganizations?.slice(0, 2).map(org => (
                <ContributorCardHorizontal
                  key={org.id}
                  profile={org.profile}
                  url={buildOrganizationUrl(org.nameID)}
                  onContact={() => {
                    sendMessage('organization', {
                      id: org.id,
                      displayName: org.profile.displayName,
                      avatarUri: org.profile.avatar?.uri,
                      country: org.profile.location?.country,
                      city: org.profile.location?.city,
                    });
                  }}
                />
              ))}
            </Gutters>
          </PageContentBlock>
          <FullWidthButton startIcon={<InfoOutlined />} onClick={() => setIsAboutDialogOpen(true)} variant="contained">
            {t('common.aboutThis', { entity: translatedJourneyTypeName })}
          </FullWidthButton>
          <DashboardNavigation
            spaceNameId={spaceNameId}
            spaceVisibility={spaceVisibility}
            displayName={displayName}
            dashboardNavigation={dashboardNavigation}
            loading={dashboardNavigationLoading}
          />
          {timelineReadAccess && <DashboardCalendarSection journeyLocation={journeyLocation} />}
          {communityReadAccess && <DashboardUpdatesSection entities={{ spaceId: spaceNameId, communityId }} />}
          {childrenLeft}
        </PageContentColumn>

        <PageContentColumn columns={8}>
          {recommendations && (
            <PageContentBlockSeamless halfWidth={hasTopCallouts} disablePadding>
              {recommendations}
            </PageContentBlockSeamless>
          )}
          {hasTopCallouts && (
            <PageContentBlock halfWidth={!!recommendations}>
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
              <ScrollableCardsLayout items={childEntities} deps={[spaceNameId]}>
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
        journeyTypeName="space"
        displayName={displayName}
        tagline={tagline}
        references={references}
        sendMessageToCommunityLeads={sendMessageToCommunityLeads}
        metrics={metrics}
        description={vision}
        background={description}
        who={who}
        impact={impact}
        loading={loading}
        leadUsers={leadUsers}
        hostOrganizations={hostOrganizations}
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

export default SpaceDashboardView;
