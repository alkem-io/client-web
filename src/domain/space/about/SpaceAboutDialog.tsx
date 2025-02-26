import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { NAVIGATION_CONTAINER_HEIGHT_GUTTERS } from '@/core/ui/navigation/NavigationBar';
import { gutters } from '@/core/ui/grid/utils';
import { Box, Link, Tooltip } from '@mui/material';
import { ReactNode } from 'react';
import { Caption } from '@/core/ui/typography';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import EntityDashboardLeadsSection from '@/domain/community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import { useTranslation } from 'react-i18next';
import { EntityDashboardLeads } from '@/domain/community/community/EntityDashboardContributorsSection/Types';
import { Metric } from '@/domain/platform/metrics/utils/getMetricCount';
import { Theme } from '@mui/material/styles';
import useCurrentBreakpoint from '@/core/ui/utils/useCurrentBreakpoint';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import References from '@/domain/shared/components/References/References';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import FlagCircleOutlinedIcon from '@mui/icons-material/FlagCircleOutlined';
import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import { VirtualContributorProps } from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import { SpaceAboutDetailsModel } from './model/spaceAboutFull.model';
import AboutHeader from '@/domain/space/about/components/AboutHeader';
import Gutters from '@/core/ui/grid/Gutters';
import AboutDescription from '@/domain/space/about/components/AboutDescription';

export interface JourneyAboutDialogProps extends EntityDashboardLeads {
  open: boolean;
  spaceLevel: SpaceLevel | undefined;
  about?: SpaceAboutDetailsModel | undefined;
  ribbon?: ReactNode;
  startButton?: ReactNode;
  endButton?: ReactNode;
  applyButton?: ReactNode;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  metrics: Metric[] | undefined;
  guidelines?: ReactNode;
  loading?: boolean;
  leftColumnChildrenTop?: ReactNode;
  virtualContributors?: VirtualContributorProps[];
  hasReadPrivilege?: boolean;
  hasInvitePrivilege?: boolean;
}

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
  metrics,
  guidelines,
  loading = false,
  startButton,
  endButton,
  applyButton,
  leftColumnChildrenTop,
}: JourneyAboutDialogProps) => {
  const { t } = useTranslation();

  const isSpace = spaceLevel === SpaceLevel.L0;
  const leadOrganizationsHeader = isSpace
    ? 'pages.space.sections.dashboard.leadingOrganizations'
    : 'community.leading-organizations';
  const leadUsersHeader = 'community.leads';

  const breakpoint = useCurrentBreakpoint();

  const isMobile = breakpoint === 'xs';

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });
  const aboutProfile = about?.profile;

  const openEditDialog = (section: string) => {
    console.log(section);
    // TODO: implement edit dialog
  };

  return (
    <DialogWithGrid
      open={open}
      columns={8}
      fullHeight
      sx={{ marginTop: gutters(NAVIGATION_CONTAINER_HEIGHT_GUTTERS), alignItems: 'stretch', pointerEvents: 'auto' }}
      BackdropProps={{ sx: { background: gradient, pointerEvents: 'none' } }}
    >
      <AboutHeader
        title={aboutProfile?.displayName}
        tagline={aboutProfile?.tagline}
        loading={loading}
        startIcon={startButton}
        endButton={endButton}
      />
      {ribbon}
      <Box flexGrow={1} flexShrink={1} minHeight={0} sx={{ overflowY: 'auto', backgroundColor: 'background.default' }}>
        <Gutters>
          <PageContentColumn columns={8}>
            <PageContentColumn columns={4}>
              <PageContentBlock accent>
                <AboutDescription
                  description={aboutProfile?.description}
                  loading={loading}
                  location={aboutProfile?.location}
                  metrics={metrics}
                  onEditClick={() => openEditDialog('description')}
                />
              </PageContentBlock>
              {applyButton && (
                <Box display="flex" justifyContent="center" width="100%">
                  {applyButton}
                </Box>
              )}
            </PageContentColumn>
            <PageContentColumn columns={4}>
              <EntityDashboardLeadsSection
                organizationsHeader={t(leadOrganizationsHeader)}
                usersHeader={t(leadUsersHeader)}
                leadUsers={leadUsers}
                leadOrganizations={leadOrganizations}
              />
            </PageContentColumn>
            {about?.why && (
              <PageContentBlock>
                <AboutDescription
                  title={t(`context.${spaceLevel}.why.title` as const)}
                  titleIcon={<FlagCircleOutlinedIcon />}
                  description={about.why}
                  loading={loading}
                  onEditClick={() => openEditDialog('why')}
                />
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
          <PageContentColumn columns={8}>
            <PageContentBlockSeamless disablePadding order={1}>
              {leftColumnChildrenTop}
              <PageContentBlock>
                <PageContentBlockHeader title={t('components.referenceSegment.title')} />
                <References references={aboutProfile?.references} />
              </PageContentBlock>
            </PageContentBlockSeamless>
            <PageContentBlockSeamless disablePadding order={isMobile ? 1 : 0}>
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
          </PageContentColumn>
        </Gutters>
      </Box>
    </DialogWithGrid>
  );
};

export default SpaceAboutDialog;
