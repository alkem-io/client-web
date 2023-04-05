import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { TopBarHeightGutters } from '../../../../common/components/composite/layout/TopBar/TopBar';
import { gutters } from '../../../../core/ui/grid/utils';
import { Box, BoxProps } from '@mui/material';
import React, { ReactNode, useMemo, useRef, useState } from 'react';
import { PageTitle, Tagline } from '../../../../core/ui/typography';
import BackButton from '../../../../core/ui/actions/BackButton';
import ApplicationButton from '../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import PageContentRibbon from '../../../../core/ui/content/PageContentRibbon';
import { HubOutlined, LockOutlined } from '@mui/icons-material';
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
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import { OpportunityIcon } from '../../opportunity/icon/OpportunityIcon';
import { Metric } from '../../../platform/metrics/utils/getMetricCount';
import useMetricsItems from '../../../platform/metrics/utils/useMetricsItems';
import HubMetrics from '../../hub/Metrics/HubMetrics';
import ChallengeMetrics from '../../challenge/utils/useChallengeMetricsItems';
import OpportunityMetrics from '../../opportunity/utils/useOpportunityMetricsItems';
import { useLocation, useNavigate } from 'react-router-dom';
import { Theme } from '@mui/material/styles';

interface JourneyUnauthorizedDialogProps extends EntityDashboardLeads {
  journeyTypeName: JourneyTypeName;
  displayName: ReactNode;
  tagline: ReactNode;
  communityReadAccess: boolean | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  metrics: Metric[] | undefined;
  privilegesLoading: boolean;
  authorized: boolean | undefined;
  description: string | undefined;
  background: string | undefined;
  who: string | undefined;
  impact: string | undefined;
  loading: boolean;
  disabled?: boolean;
}

interface DialogHeaderItemProps extends BoxProps {
  align?: 'start' | 'end' | 'center';
}

const DialogHeaderItem = ({ align = 'center', ...props }: DialogHeaderItemProps) => {
  return <Box {...props} flexGrow={1} display="flex" justifyContent={align} alignItems="center" gap={gutters()} />;
};

const getJourneyIconComponent = (journeyTypeName: JourneyTypeName) => {
  switch (journeyTypeName) {
    case 'hub':
      return HubOutlined;
    case 'challenge':
      return ChallengeIcon;
    case 'opportunity':
      return OpportunityIcon;
  }
};

const getMetricsSpec = (journeyTypeName: JourneyTypeName) => {
  switch (journeyTypeName) {
    case 'hub':
      return HubMetrics;
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

const JourneyUnauthorizedDialog = ({
  displayName,
  tagline,
  journeyTypeName,
  communityReadAccess,
  leadUsers,
  leadOrganizations,
  sendMessageToCommunityLeads,
  metrics,
  description,
  background,
  who,
  impact,
  authorized,
  privilegesLoading,
  loading,
  disabled = false,
}: JourneyUnauthorizedDialogProps) => {
  const { t } = useTranslation();

  const isHub = journeyTypeName === 'hub';
  const leadOrganizationsHeader = isHub
    ? 'pages.hub.sections.dashboard.organization'
    : 'community.leading-organizations';
  const leadUsersHeader = isHub ? 'community.host' : 'community.leads';

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
        title: user.profile.displayName,
        country: user.profile.location?.country,
        city: user.profile.location?.city,
        avatarUri: user.profile.visual?.uri,
      })),
    [leadUsers]
  );

  const JourneyIcon = getJourneyIconComponent(journeyTypeName);

  const metricsItems = useMetricsItems(metrics, getMetricsSpec(journeyTypeName));

  const location = useLocation();
  const navigate = useNavigate();

  const canGoBack = location.key !== 'default';

  const applicationButtonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  return (
    <DialogWithGrid
      open={!disabled && !privilegesLoading && !authorized}
      columns={12}
      fullHeight
      sx={{ marginTop: gutters(TopBarHeightGutters), alignItems: 'stretch', pointerEvents: 'auto' }}
      BackdropProps={{ sx: { background: gradient, pointerEvents: 'none' } }}
    >
      <Box padding={gutters()}>
        <Box display="flex" gap={gutters()} alignItems="start">
          <DialogHeaderItem minWidth="30%" align="start">
            {canGoBack && <BackButton onClick={() => navigate(-1)} />}
          </DialogHeaderItem>
          <DialogHeaderItem>
            <JourneyIcon fontSize="small" color="primary" />
            <PageTitle paddingY={gutters(0.5)}>{displayName}</PageTitle>
          </DialogHeaderItem>
          <DialogHeaderItem minWidth="30%" align="end">
            <ApplicationButtonContainer>
              {(e, s) => (
                <ApplicationButton ref={applicationButtonRef} {...e?.applicationButtonProps} loading={s.loading} />
              )}
            </ApplicationButtonContainer>
          </DialogHeaderItem>
        </Box>
        <Tagline textAlign="center">{tagline}</Tagline>
      </Box>
      <PageContentRibbon onClick={() => applicationButtonRef.current?.click()} sx={{ cursor: 'pointer' }}>
        <Box display="flex" gap={gutters(0.5)} alignItems="center" justifyContent="center">
          <LockOutlined fontSize="small" />
          {t('components.journeyUnauthorizedDialog.message')}
        </Box>
      </PageContentRibbon>
      <Box flexGrow={1} flexShrink={1} minHeight={0} sx={{ overflowY: 'auto', backgroundColor: 'background.default' }}>
        <Gutters row flexWrap="wrap">
          <PageContentColumn columns={4}>
            <EntityDashboardLeadsSection
              organizationsHeader={t(leadOrganizationsHeader)}
              usersHeader={t(leadUsersHeader)}
              leadUsers={leadUsers}
              leadOrganizations={leadOrganizations}
            />
            {communityReadAccess && (
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
            {impact && (
              <PageContentBlock>
                <PageContentBlockHeader title={t('context.hub.impact.title')} />
                <WrapperMarkdown>{impact}</WrapperMarkdown>
              </PageContentBlock>
            )}
            {who && (
              <PageContentBlock>
                <PageContentBlockHeader title={t('context.hub.who.title')} />
                <WrapperMarkdown>{who}</WrapperMarkdown>
              </PageContentBlock>
            )}
            <PageContentBlock>
              <PageContentBlockHeader title={t('pages.hub.sections.dashboard.activity')} />
              <ActivityView activity={metricsItems} loading={loading} />
            </PageContentBlock>
          </PageContentColumn>
          <PageContentColumn columns={8}>
            {description && (
              <PageContentBlock accent>
                <WrapperMarkdown>{description}</WrapperMarkdown>
              </PageContentBlock>
            )}
            {background && (
              <PageContentBlock>
                <PageContentBlockHeader title={t('context.hub.background.title')} />
                <WrapperMarkdown>{background}</WrapperMarkdown>
              </PageContentBlock>
            )}
          </PageContentColumn>
        </Gutters>
      </Box>
    </DialogWithGrid>
  );
};

export default JourneyUnauthorizedDialog;
