import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { TopBarHeightGutters } from '../../../../common/components/composite/layout/TopBar/TopBar';
import { gutters } from '../../../../core/ui/grid/utils';
import { Box, BoxProps } from '@mui/material';
import React, { ReactNode, useMemo, useState } from 'react';
import { PageTitle, Tagline } from '../../../../core/ui/typography';
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

export interface JourneyAboutDialogProps extends EntityDashboardLeads {
  open: boolean;
  journeyTypeName: JourneyTypeName;
  displayName: ReactNode;
  tagline: ReactNode;
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
  ribbon,
  journeyTypeName,
  leadUsers,
  leadOrganizations,
  sendMessageToCommunityLeads,
  metrics,
  description,
  background,
  who,
  impact,
  loading,
  startButton,
  endButton,
}: JourneyAboutDialogProps) => {
  const { t } = useTranslation();

  const isSpace = journeyTypeName === 'space';
  const leadOrganizationsHeader = isSpace
    ? 'pages.space.sections.dashboard.organization'
    : 'community.leading-organizations';
  const leadUsersHeader = isSpace ? 'community.host' : 'community.leads';

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
        avatarUri: user.profile.visual?.uri,
      })),
    [leadUsers]
  );

  const JourneyIcon = journeyIcon[journeyTypeName];

  const metricsItems = useMetricsItems(metrics, getMetricsSpec(journeyTypeName));

  const breakpoint = useCurrentBreakpoint();

  const isMobile = breakpoint === 'xs';

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
                <PageContentBlockHeader title={t('context.space.background.title')} />
                <WrapperMarkdown>{background}</WrapperMarkdown>
              </PageContentBlock>
            )}
          </PageContentColumn>
          <PageContentColumn columns={4}>
            <PageContentBlockSeamless disablePadding order={1}>
              {impact && (
                <PageContentBlock>
                  <PageContentBlockHeader title={t('context.space.impact.title')} />
                  <WrapperMarkdown>{impact}</WrapperMarkdown>
                </PageContentBlock>
              )}
              {who && (
                <PageContentBlock>
                  <PageContentBlockHeader title={t('context.space.who.title')} />
                  <WrapperMarkdown>{who}</WrapperMarkdown>
                </PageContentBlock>
              )}
              <PageContentBlock>
                <PageContentBlockHeader title={t('pages.space.sections.dashboard.activity')} />
                <ActivityView activity={metricsItems} loading={loading} />
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
            </PageContentBlockSeamless>
          </PageContentColumn>
        </Gutters>
      </Box>
    </DialogWithGrid>
  );
};

export default JourneyAboutDialog;
