import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { NAVIGATION_CONTAINER_HEIGHT_GUTTERS } from '@/core/ui/navigation/NavigationBar';
import { gutters } from '@/core/ui/grid/utils';
import { Box, Link, Tooltip } from '@mui/material';
import { MouseEventHandler, useRef } from 'react';
import { Caption } from '@/core/ui/typography';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import EntityDashboardLeadsSection from '@/domain/community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import { Trans, useTranslation } from 'react-i18next';
import { Theme } from '@mui/material/styles';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import References from '@/domain/shared/components/References/References';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import FlagCircleOutlinedIcon from '@mui/icons-material/FlagCircleOutlined';
import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import { VirtualContributorProps } from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import AboutHeader from '@/domain/space/about/components/AboutHeader';
import Gutters from '@/core/ui/grid/Gutters';
import AboutDescription from '@/domain/space/about/components/AboutDescription';
import Loading from '@/core/ui/loading/Loading';
import ApplicationButton from '@/domain/community/application/applicationButton/ApplicationButton';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import RouterLink from '@/core/ui/link/RouterLink';
import CommunityGuidelinesBlock from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesBlock';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import useNavigate from '@/core/routing/useNavigate';
import { SpaceDashboardSpaceDetails } from '../layout/TabbedSpaceL0/Tabs/SpaceDashboard/SpaceDashboardView';

export interface SpaceAboutDialogProps {
  open: boolean;
  space: SpaceDashboardSpaceDetails;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  loading?: boolean;
  virtualContributors?: VirtualContributorProps[];
  hasReadPrivilege?: boolean;
  hasEditPrivilege?: boolean;
  hasInvitePrivilege?: boolean;
  onClose?: () => void;
}

const gradient = (theme: Theme) =>
  `linear-gradient(180deg, rgba(0,0,0,0) 0, rgba(0,0,0,0) ${gutters(NAVIGATION_CONTAINER_HEIGHT_GUTTERS + 1)(
    theme
  )}, rgba(0,0,0,.5) 100%);`;

const SpaceAboutDialog = ({
  open,
  space,
  loading = false,
  onClose,
  hasReadPrivilege,
  hasEditPrivilege = false,
}: SpaceAboutDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isLevelZeroSpace = space?.level === SpaceLevel.L0;
  const { about } = space;
  const metrics = about?.metrics || [];
  const membership = about?.membership;

  const leadOrganizationsHeader = isLevelZeroSpace
    ? 'pages.space.sections.dashboard.leadingOrganizations'
    : 'community.leading-organizations';
  const leadUsersHeader = 'community.leads';

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });
  const applicationButtonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  const aboutProfile = about?.profile;
  const communityId = about?.membership.communityID;

  const openEditDialog = () => {
    if (aboutProfile?.url) {
      navigate(buildSettingsUrl(aboutProfile?.url!));
    }
  };

  const provider = about?.provider;
  const leadOrganizations = membership?.leadOrganizations;
  const leadUsers = membership?.leadUsers;
  const hasLeads = Boolean(leadOrganizations?.length || leadUsers?.length);

  const hasReferences = Boolean(aboutProfile?.references?.length);

  const handleLearnWhyClick: MouseEventHandler = event => {
    event.preventDefault();
    applicationButtonRef.current?.click();
  };

  const renderHost = () => {
    if (!provider) {
      return null;
    }

    if (loading) {
      return <Loading />;
    }

    return (
      <EntityDashboardLeadsSection
        organizationsHeader={t('pages.space.sections.dashboard.organization')}
        organizationsHeaderIcon={
          <Tooltip title={t('pages.space.sections.dashboard.hostTooltip')} arrow>
            <InfoOutlinedIcon color="primary" />
          </Tooltip>
        }
        leadOrganizations={leadOrganizations}
        leadUsers={undefined}
      >
        {provider && (
          <Caption
            component={Link}
            onClick={() =>
              sendMessage('organization', {
                id: provider.id,
                displayName: provider.profile.displayName,
                avatarUri: provider.profile.avatar?.uri,
                country: provider.profile.location?.country,
                city: provider.profile.location?.city,
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
    );
  };

  const spaceLevel = space.level || SpaceLevel.L0;

  return (
    <DialogWithGrid
      open={open}
      columns={8}
      sx={{ marginTop: gutters(NAVIGATION_CONTAINER_HEIGHT_GUTTERS), alignItems: 'stretch', pointerEvents: 'auto' }}
      BackdropProps={{ sx: { background: gradient, pointerEvents: 'none' } }}
    >
      <AboutHeader
        title={aboutProfile?.displayName}
        tagline={aboutProfile?.tagline}
        loading={loading}
        onClose={onClose}
        startIcon={
          !hasReadPrivilege && (
            <Tooltip
              arrow
              placement="top"
              title={
                <Caption>
                  <Trans
                    i18nKey={'components.journeyUnauthorizedDialog.message'}
                    components={{
                      apply: (
                        <RouterLink to="" sx={{ color: 'white' }} underline="always" onClick={handleLearnWhyClick} />
                      ),
                    }}
                  />
                </Caption>
              }
            >
              <LockOutlined color="primary" fontSize="small" />
            </Tooltip>
          )
        }
      />
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
                  iconColor="white"
                  canEdit={hasEditPrivilege}
                  onEditClick={openEditDialog}
                />
              </PageContentBlock>
              <Box display="flex" justifyContent="center" width="100%">
                <ApplicationButtonContainer journeyId={space.id}>
                  {(applicationButtonProps, loading) => {
                    if (loading || applicationButtonProps.isMember) {
                      return null;
                    }

                    return (
                      <ApplicationButton
                        ref={applicationButtonRef}
                        {...applicationButtonProps}
                        loading={loading}
                        journeyId={space.id}
                        spaceLevel={space.level}
                      />
                    );
                  }}
                </ApplicationButtonContainer>
              </Box>
            </PageContentColumn>

            <PageContentColumn columns={4}>
              {hasLeads ? (
                <EntityDashboardLeadsSection
                  organizationsHeader={t(leadOrganizationsHeader)}
                  usersHeader={t(leadUsersHeader)}
                  leadUsers={leadUsers}
                  leadOrganizations={leadOrganizations}
                />
              ) : (
                renderHost()
              )}
            </PageContentColumn>

            {about?.why && (
              <PageContentBlock>
                <AboutDescription
                  title={t(`context.${spaceLevel}.why.title` as const)}
                  titleIcon={<FlagCircleOutlinedIcon />}
                  description={about.why}
                  loading={loading}
                  canEdit={hasEditPrivilege}
                  onEditClick={openEditDialog}
                />
              </PageContentBlock>
            )}

            {about?.who && (
              <PageContentBlock>
                <AboutDescription
                  title={t(`context.${spaceLevel}.who.title` as const)}
                  titleIcon={<SupervisedUserCircleOutlinedIcon />}
                  description={about.who}
                  loading={loading}
                  canEdit={hasEditPrivilege}
                  onEditClick={openEditDialog}
                />
              </PageContentBlock>
            )}

            {communityId && <CommunityGuidelinesBlock communityId={communityId} spaceUrl={aboutProfile?.url} />}

            {hasReferences && (
              <PageContentBlock>
                <AboutDescription
                  title={t('components.referenceSegment.title')}
                  loading={loading}
                  canEdit={hasEditPrivilege}
                  onEditClick={openEditDialog}
                >
                  <Box paddingTop={gutters(1)}>
                    <References references={aboutProfile?.references} />
                  </Box>
                </AboutDescription>
              </PageContentBlock>
            )}

            {hasLeads && <PageContentBlockSeamless disablePadding>{renderHost()}</PageContentBlockSeamless>}
          </PageContentColumn>
        </Gutters>
      </Box>
    </DialogWithGrid>
  );
};

export default SpaceAboutDialog;
