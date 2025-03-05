import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { NAVIGATION_CONTAINER_HEIGHT_GUTTERS } from '@/core/ui/navigation/NavigationBar';
import { gutters } from '@/core/ui/grid/utils';
import { Box, BoxProps, Link, Tooltip } from '@mui/material';
import { ReactNode, useMemo, useState } from 'react';
import { Caption, PageTitle, Tagline } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import EntityDashboardLeadsSection from '@/domain/community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import { useTranslation } from 'react-i18next';
import { EntityDashboardLeads } from '@/domain/community/community/EntityDashboardContributorsSection/Types';
import ContactLeadsButton from '@/domain/community/community/ContactLeadsButton/ContactLeadsButton';
import {
  DirectMessageDialog,
  MessageReceiverChipData,
} from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import ActivityView from '@/domain/platform/metrics/views/MetricsView';
import { Metric } from '@/domain/platform/metrics/utils/getMetricCount';
import useMetricsItems from '@/domain/platform/metrics/utils/useMetricsItems';
import SpaceMetrics from '@/domain/journey/space/Metrics/SpaceMetrics';
import OpportunityMetrics from '@/domain/journey/opportunity/utils/useOpportunityMetricsItems';
import { Theme } from '@mui/material/styles';
import useCurrentBreakpoint from '@/core/ui/utils/useCurrentBreakpoint';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import { spaceIconByLevel } from '@/domain/shared/components/SpaceIcon/SpaceIcon';
import References from '@/domain/shared/components/References/References';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import FlagCircleOutlinedIcon from '@mui/icons-material/FlagCircleOutlined';
import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import Loading from '@/core/ui/loading/Loading';
import VirtualContributorsBlock from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsBlock';
import { VirtualContributorProps } from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import { SpaceAboutDetailsModel } from './model/spaceAboutFull.model';

export interface JourneyAboutDialogProps extends EntityDashboardLeads {
  open: boolean;
  spaceLevel: SpaceLevel | undefined;
  about?: SpaceAboutDetailsModel | undefined;
  ribbon?: ReactNode;
  startButton?: ReactNode;
  endButton?: ReactNode;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  metrics: Metric[] | undefined;
  guidelines?: ReactNode;
  loading?: boolean;
  leftColumnChildrenTop?: ReactNode;
  leftColumnChildrenBottom?: ReactNode;
  virtualContributors?: VirtualContributorProps[];
  hasReadPrivilege?: boolean;
  hasInvitePrivilege?: boolean;
}

interface DialogHeaderItemProps extends BoxProps {
  align?: 'start' | 'end' | 'center';
}

const DialogHeaderItem = ({ align = 'center', ...props }: DialogHeaderItemProps) => {
  return <Box {...props} flexGrow={1} display="flex" justifyContent={align} alignItems="center" gap={gutters()} />;
};

const getMetricsSpec = (spaceLevel: SpaceLevel | undefined) => {
  if (!spaceLevel) {
    return undefined;
  }
  if (spaceLevel === SpaceLevel.L2) {
    return OpportunityMetrics;
  }
  return SpaceMetrics;
};

const gradient = (theme: Theme) =>
  `linear-gradient(180deg, rgba(0,0,0,0) 0, rgba(0,0,0,0) ${gutters(NAVIGATION_CONTAINER_HEIGHT_GUTTERS + 1)(
    theme
  )}, rgba(0,0,0,.5) 100%);`;

const SpaceAboutDialog = ({
  open,
  about,
  ribbon,
  spaceLevel = SpaceLevel.L0,
  leadUsers,
  leadOrganizations,
  provider: host,
  sendMessageToCommunityLeads,
  metrics,
  guidelines,
  loading = false,
  startButton,
  endButton,
  leftColumnChildrenTop,
  leftColumnChildrenBottom,
  virtualContributors,
  hasReadPrivilege,
  hasInvitePrivilege,
}: JourneyAboutDialogProps) => {
  const { t } = useTranslation();

  const isSpace = spaceLevel === SpaceLevel.L0;
  const leadOrganizationsHeader = isSpace
    ? 'pages.space.sections.dashboard.leadingOrganizations'
    : 'community.leading-organizations';
  const leadUsersHeader = 'community.leads';

  const [isContactLeadUsersDialogOpen, setIsContactLeadUsersDialogOpen] = useState(false);

  const openContactLeadsDialog = () => {
    setIsContactLeadUsersDialogOpen(true);
  };

  const closeContactLeadsDialog = () => {
    setIsContactLeadUsersDialogOpen(false);
  };

  const messageReceivers = useMemo(
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

  const JourneyIcon = spaceIconByLevel[spaceLevel];
  const metricsItems = useMetricsItems(metrics, getMetricsSpec(spaceLevel));

  const breakpoint = useCurrentBreakpoint();

  const isMobile = breakpoint === 'xs';

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });
  const aboutProfile = about?.profile;

  return (
    <DialogWithGrid
      open={open}
      columns={12}
      fullHeight
      sx={{ marginTop: gutters(NAVIGATION_CONTAINER_HEIGHT_GUTTERS), alignItems: 'stretch', pointerEvents: 'auto' }}
      BackdropProps={{ sx: { background: gradient, pointerEvents: 'none' } }}
    >
      <Box padding={gutters()}>
        <Box
          display="flex"
          gap={gutters()}
          rowGap={gutters(0.5)}
          alignItems="start"
          flexWrap={isMobile ? 'wrap' : 'nowrap'}
        >
          {loading && (
            <Box position="absolute">
              <Loading text="" />
            </Box>
          )}
          <DialogHeaderItem minWidth="30%" align="start">
            {startButton}
          </DialogHeaderItem>
          <DialogHeaderItem order={isMobile ? 1 : 0}>
            {JourneyIcon && <JourneyIcon fontSize="small" color="primary" />}
            <PageTitle paddingY={gutters(0.5)}>{aboutProfile?.displayName}</PageTitle>
          </DialogHeaderItem>
          <DialogHeaderItem minWidth="30%" align="end">
            {aboutProfile?.url && <ShareButton url={aboutProfile.url} entityTypeName="about" />}
            {endButton}
          </DialogHeaderItem>
        </Box>
        <Tagline textAlign="center">{about?.profile.tagline}</Tagline>
      </Box>
      {ribbon}
      <Box flexGrow={1} flexShrink={1} minHeight={0} sx={{ overflowY: 'auto', backgroundColor: 'background.default' }}>
        <Gutters flexWrap="wrap" flexDirection={isMobile ? 'row' : 'row-reverse'}>
          <PageContentColumn columns={8}>
            {aboutProfile?.description && (
              <PageContentBlock>
                <PageContentBlockHeader
                  icon={<InfoOutlinedIcon />}
                  title={t(`context.${spaceLevel}.description.title`)}
                />
                <WrapperMarkdown>{aboutProfile.description}</WrapperMarkdown>
              </PageContentBlock>
            )}
            {about?.why && (
              <PageContentBlock>
                <PageContentBlockHeader
                  icon={<FlagCircleOutlinedIcon />}
                  title={t(`context.${spaceLevel}.why.title` as const)}
                />
                <WrapperMarkdown>{about.why}</WrapperMarkdown>
              </PageContentBlock>
            )}
            {about?.who && (
              <PageContentBlock>
                <PageContentBlockHeader
                  icon={<SupervisedUserCircleOutlinedIcon />}
                  title={t(`context.${spaceLevel}.who.title` as const)}
                />
                <WrapperMarkdown>{about.who}</WrapperMarkdown>
              </PageContentBlock>
            )}
            {guidelines}
          </PageContentColumn>
          <PageContentColumn columns={4}>
            <PageContentBlockSeamless disablePadding order={1}>
              {leftColumnChildrenTop}
              <PageContentBlock>
                <PageContentBlockHeader
                  title={t('components.journeyMetrics.title', {
                    journey: t(`common.space-level.${spaceLevel}` as const),
                  })}
                />
                <ActivityView activity={metricsItems} loading={loading} />
              </PageContentBlock>
              <PageContentBlock>
                <PageContentBlockHeader title={t('components.referenceSegment.title')} />
                <References references={aboutProfile?.references} />
              </PageContentBlock>
            </PageContentBlockSeamless>
            <PageContentBlockSeamless disablePadding order={isMobile ? 1 : 0}>
              <EntityDashboardLeadsSection
                organizationsHeader={t(leadOrganizationsHeader)}
                usersHeader={t(leadUsersHeader)}
                leadUsers={leadUsers}
                leadOrganizations={leadOrganizations}
              />
              {messageReceivers.length !== 0 && (
                <>
                  <ContactLeadsButton onClick={openContactLeadsDialog}>
                    {t('buttons.contact-leads', { contact: t(leadUsersHeader) })}
                  </ContactLeadsButton>
                  <DirectMessageDialog
                    title={t('send-message-dialog.community-message-title', { contact: t(leadUsersHeader) })}
                    open={isContactLeadUsersDialogOpen}
                    onClose={closeContactLeadsDialog}
                    onSendMessage={sendMessageToCommunityLeads}
                    messageReceivers={messageReceivers}
                  />
                </>
              )}
              {host && (
                <EntityDashboardLeadsSection
                  organizationsHeader={t('pages.space.sections.dashboard.organization')}
                  organizationsHeaderIcon={
                    <Tooltip title={t('pages.space.sections.dashboard.hostTooltip')} arrow>
                      <InfoOutlinedIcon color="primary" />
                    </Tooltip>
                  }
                  leadOrganizations={host && [host]}
                  leadUsers={undefined}
                >
                  {host && (
                    <Caption
                      component={Link}
                      onClick={() =>
                        sendMessage('organization', {
                          id: host.id,
                          displayName: host.profile.displayName,
                          avatarUri: host.profile.avatar?.uri,
                          country: host.profile.location?.country,
                          city: host.profile.location?.city,
                        })
                      }
                      sx={{ cursor: 'pointer' }}
                    >
                      <MailOutlineIcon color="primary" sx={{ verticalAlign: 'bottom', marginRight: gutters(0.5) }} />
                      {t('pages.space.sections.dashboard.hostContact')}
                    </Caption>
                  )}
                  {directMessageDialog}
                </EntityDashboardLeadsSection>
              )}
            </PageContentBlockSeamless>
            {leftColumnChildrenBottom}
            {hasReadPrivilege && virtualContributors && virtualContributors?.length > 0 && (
              <VirtualContributorsBlock
                virtualContributors={virtualContributors}
                loading={loading}
                showInviteOption={hasInvitePrivilege}
              />
            )}
          </PageContentColumn>
        </Gutters>
      </Box>
    </DialogWithGrid>
  );
};

export default SpaceAboutDialog;
