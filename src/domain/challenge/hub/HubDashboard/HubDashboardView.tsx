import React, { ReactElement, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import References from '../../../shared/components/References/References';
import {
  AssociatedOrganizationDetailsFragment,
  DashboardLeadUserFragment,
  DashboardTopCalloutFragment,
  HubWelcomeBlockContributorProfileFragment,
  Reference,
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
import { Button, ButtonProps, IconButton, Theme } from '@mui/material';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import JourneyAboutDialog from '../../common/JourneyAboutDialog/JourneyAboutDialog';
import { Metric } from '../../../platform/metrics/utils/getMetricCount';
import { Close, InfoOutlined } from '@mui/icons-material';
import OverflowGradient from '../../../../core/ui/overflow/OverflowGradient';
import { gutters } from '../../../../core/ui/grid/utils';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import Gutters from '../../../../core/ui/grid/Gutters';
import HubWelcomeSectionContributor from '../HubWelcomeSection/HubWelcomeSectionContributor';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import DashboardMemberIcon from '../../../community/membership/DashboardMemberIcon/DashboardMemberIcon';
import { DashboardNavigationItem } from '../HubDashboardNavigation/useHubDashboardNavigation';
import DashboardNavigation from '../HubDashboardNavigation/DashboardNavigation';

interface HubWelcomeBlockContributor {
  profile: HubWelcomeBlockContributorProfileFragment;
}

interface HubDashboardViewProps<ChildEntity extends Identifiable> extends Partial<CoreEntityIdTypes> {
  displayName: ReactNode;
  tagline: ReactNode;
  metrics: Metric[] | undefined;
  description: string | undefined;
  dashboardNavigation: DashboardNavigationItem[] | undefined;
  dashboardNavigationLoading: boolean;
  who: string | undefined;
  impact: string | undefined;
  vision?: string;
  communityId?: string;
  organization?: unknown;
  references: Reference[] | undefined;
  leadOrganizations: (HubWelcomeBlockContributor & AssociatedOrganizationDetailsFragment)[] | undefined;
  leadUsers: (HubWelcomeBlockContributor & DashboardLeadUserFragment)[] | undefined;
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

const FullWidthButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  sx,
  ...props
}: ButtonProps<D, P>) => {
  return <Button {...props} sx={{ ...sx, width: '100%' }} />;
};

const HubDashboardView = <ChildEntity extends Identifiable>({
  vision = '',
  displayName,
  tagline,
  metrics,
  description,
  dashboardNavigation,
  dashboardNavigationLoading,
  who,
  impact,
  loading,
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
}: HubDashboardViewProps<ChildEntity>) => {
  const { t } = useTranslation();

  const journeyLocation: JourneyLocation | undefined =
    typeof hubNameId === 'undefined'
      ? undefined
      : {
          hubNameId,
          challengeNameId,
          opportunityNameId,
        };

  const showActivities = activities || activityLoading;

  const hasTopCallouts = (topCallouts ?? []).length > 0;

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

  const translatedJourneyTypeName = t(`common.${journeyTypeName}` as const);

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
                <HubWelcomeSectionContributor
                  key={user.id}
                  profile={user.profile}
                  url={buildUserProfileUrl(user.nameID)}
                />
              ))}
            </Gutters>
            <Gutters row disablePadding>
              {leadOrganizations?.slice(0, 2).map(org => (
                <HubWelcomeSectionContributor
                  key={org.id}
                  profile={org.profile}
                  url={buildOrganizationUrl(org.nameID)}
                />
              ))}
            </Gutters>
          </PageContentBlock>
          <FullWidthButton startIcon={<InfoOutlined />} onClick={() => setIsAboutDialogOpen(true)} variant="contained">
            {t('common.aboutThis', { entity: translatedJourneyTypeName })}
          </FullWidthButton>
          <DashboardNavigation
            hubNameId={hubNameId}
            displayName={displayName}
            dashboardNavigation={dashboardNavigation}
            loading={dashboardNavigationLoading}
          />
          {timelineReadAccess && <DashboardCalendarSection journeyLocation={journeyLocation} />}
          <PageContentBlock>
            <PageContentBlockHeader title={t('components.referenceSegment.title')} />
            <References references={references} />
            {/* TODO figure out the URL for references */}
          </PageContentBlock>
          {communityReadAccess && <DashboardUpdatesSection entities={{ hubId: hubNameId, communityId }} />}
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

export default HubDashboardView;
