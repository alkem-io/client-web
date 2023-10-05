import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { TopBarHeightGutters } from '../../../../main/ui/layout/topBar/TopBar';
import { gutters } from '../../../../core/ui/grid/utils';
import { Box, BoxProps, Link, Tooltip } from '@mui/material';
import React, { ReactNode, useMemo, useState } from 'react';
import { Caption, PageTitle, Tagline } from '../../../../core/ui/typography';
import Gutters from '../../../../core/ui/grid/Gutters';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import EntityDashboardLeadsSection from '../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import { JourneyTypeName } from '../../JourneyTypeName';
import { useTranslation } from 'react-i18next';
import { EntityDashboardLeads } from '../../../community/community/EntityDashboardContributorsSection/Types';
import ContactLeadsButton from '../../../community/community/ContactLeadsButton/ContactLeadsButton';
import {
  DirectMessageDialog,
  MessageReceiverChipData,
} from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import ActivityView from '../../../platform/metrics/views/MetricsView';
import { Metric } from '../../../platform/metrics/utils/getMetricCount';
import useMetricsItems from '../../../platform/metrics/utils/useMetricsItems';
import SpaceMetrics from '../../space/Metrics/SpaceMetrics';
import ChallengeMetrics from '../../challenge/utils/useChallengeMetricsItems';
import OpportunityMetrics from '../../opportunity/utils/useOpportunityMetricsItems';
import { Theme } from '@mui/material/styles';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import journeyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import References from '../../../shared/components/References/References';
import { Reference } from '../../../../core/apollo/generated/graphql-schema';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';

export interface JourneyAboutDialogProps extends EntityDashboardLeads {
  open: boolean;
  journeyTypeName: JourneyTypeName;
  displayName: ReactNode;
  tagline: ReactNode;
  references: Reference[] | undefined;
  ribbon?: ReactNode;
  startButton?: ReactNode;
  endButton?: ReactNode;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  metrics: Metric[] | undefined;
  description: string | undefined;
  background: string | undefined;
  who: string | undefined;
  impact: string | undefined;
  loading: boolean;
  leftColumnChildren?: ReactNode;
  shareUrl?: string;
}

interface DialogHeaderItemProps extends BoxProps {
  align?: 'start' | 'end' | 'center';
}

const DialogHeaderItem = ({ align = 'center', ...props }: DialogHeaderItemProps) => {
  return <Box {...props} flexGrow={1} display="flex" justifyContent={align} alignItems="center" gap={gutters()} />;
};

const getMetricsSpec = (journeyTypeName: JourneyTypeName) => {
  switch (journeyTypeName) {
    case 'space':
      return SpaceMetrics;
    case 'challenge':
      return ChallengeMetrics;
    case 'opportunity':
      return OpportunityMetrics;
  }
};

const gradient = (theme: Theme) =>
  `linear-gradient(180deg, rgba(0,0,0,0) 0, rgba(0,0,0,0) ${gutters(TopBarHeightGutters + 1)(
    theme
  )}, rgba(0,0,0,.5) 100%);`;

const JourneyAboutDialog = ({
  open,
  displayName,
  tagline,
  references,
  ribbon,
  journeyTypeName,
  leadUsers,
  leadOrganizations,
  hostOrganizations,
  sendMessageToCommunityLeads,
  metrics,
  description,
  background,
  who,
  impact,
  loading,
  startButton,
  endButton,
  leftColumnChildren,
  shareUrl,
}: JourneyAboutDialogProps) => {
  const { t } = useTranslation();

  const isSpace = journeyTypeName === 'space';
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

  const JourneyIcon = journeyIcon[journeyTypeName];

  const metricsItems = useMetricsItems(metrics, getMetricsSpec(journeyTypeName));

  const breakpoint = useCurrentBreakpoint();

  const isMobile = breakpoint === 'xs';

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  return (
    <DialogWithGrid
      open={open}
      columns={12}
      fullHeight
      sx={{ marginTop: gutters(TopBarHeightGutters), alignItems: 'stretch', pointerEvents: 'auto' }}
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
          <DialogHeaderItem minWidth="30%" align="start">
            {startButton}
          </DialogHeaderItem>
          <DialogHeaderItem order={isMobile ? 1 : 0}>
            <JourneyIcon fontSize="small" color="primary" />
            <PageTitle paddingY={gutters(0.5)}>{displayName}</PageTitle>
          </DialogHeaderItem>
          <DialogHeaderItem minWidth="30%" align="end">
            {shareUrl && <ShareButton url={shareUrl} entityTypeName="about" />}
            {endButton}
          </DialogHeaderItem>
        </Box>
        <Tagline textAlign="center">{tagline}</Tagline>
      </Box>
      {ribbon}
      <Box flexGrow={1} flexShrink={1} minHeight={0} sx={{ overflowY: 'auto', backgroundColor: 'background.default' }}>
        <Gutters flexWrap="wrap" flexDirection={isMobile ? 'row' : 'row-reverse'}>
          <PageContentColumn columns={8}>
            {description && (
              <PageContentBlock accent>
                <WrapperMarkdown>{description}</WrapperMarkdown>
              </PageContentBlock>
            )}
            {background && (
              <PageContentBlock>
                <PageContentBlockHeader title={t(`context.${journeyTypeName}.background.title` as const)} />
                <WrapperMarkdown>{background}</WrapperMarkdown>
              </PageContentBlock>
            )}
            {impact && (
              <PageContentBlock>
                <PageContentBlockHeader title={t(`context.${journeyTypeName}.impact.title` as const)} />
                <WrapperMarkdown>{impact}</WrapperMarkdown>
              </PageContentBlock>
            )}
            {who && (
              <PageContentBlock>
                <PageContentBlockHeader title={t(`context.${journeyTypeName}.who.title` as const)} />
                <WrapperMarkdown>{who}</WrapperMarkdown>
              </PageContentBlock>
            )}
          </PageContentColumn>
          <PageContentColumn columns={4}>
            <PageContentBlockSeamless disablePadding order={1}>
              <PageContentBlock>
                <PageContentBlockHeader
                  title={t('components.journeyMetrics.title', { journey: t(`common.${journeyTypeName}` as const) })}
                />
                <ActivityView activity={metricsItems} loading={loading} />
              </PageContentBlock>
              <PageContentBlock>
                <PageContentBlockHeader title={t('components.referenceSegment.title')} />
                <References references={references} />
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
              {hostOrganizations && (
                <EntityDashboardLeadsSection
                  organizationsHeader={t('pages.space.sections.dashboard.organization')}
                  organizationsHeaderIcon={
                    <Tooltip title={t('pages.space.sections.dashboard.hostTooltip')} arrow>
                      <InfoOutlinedIcon color="primary" />
                    </Tooltip>
                  }
                  leadOrganizations={hostOrganizations}
                  leadUsers={undefined}
                >
                  {hostOrganizations && hostOrganizations.length > 0 && (
                    <Caption
                      component={Link}
                      onClick={() =>
                        sendMessage('organization', {
                          id: hostOrganizations[0].id,
                          displayName: hostOrganizations[0].profile.displayName,
                          avatarUri: hostOrganizations[0].profile.avatar?.uri,
                          country: hostOrganizations[0].profile.location?.country,
                          city: hostOrganizations[0].profile.location?.city,
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
            {leftColumnChildren}
          </PageContentColumn>
        </Gutters>
      </Box>
    </DialogWithGrid>
  );
};

export default JourneyAboutDialog;
