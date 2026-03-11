import { SettingsOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardSpacesQuery } from '@/core/apollo/generated/apollo-hooks';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockTitle } from '@/core/ui/typography';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import type { LeadType } from '@/domain/space/components/cards/components/SpaceLeads';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import { collectSubspaceAvatars } from '@/domain/space/components/cards/utils/useSubspaceCardData';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import Logo from '@/main/ui/logo/logoSmall.svg?react';
import type { InnovationHubAttrs } from './InnovationHubAttrs';
import InnovationHubBanner from './InnovationHubBanner';

const InnovationHubHomePage = ({ innovationHub }: { innovationHub: InnovationHubAttrs }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useCurrentUserContext();

  const { data: spacesData } = useDashboardSpacesQuery();

  const allSpaces = spacesData?.spaces;

  const { locations } = useConfig();

  const mainHomeUrl = `//${locations?.domain}${ROUTE_HOME}`;

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const handleContactLead = useCallback(
    (leadType: LeadType, leadId: string, leadDisplayName: string, leadAvatarUri?: string) => {
      sendMessage(leadType, {
        id: leadId,
        displayName: leadDisplayName,
        avatarUri: leadAvatarUri,
      });
    },
    [sendMessage]
  );

  return (
    <TopLevelLayout
      header={
        <InnovationHubBanner
          banner={innovationHub.banner}
          displayName={innovationHub.displayName}
          tagline={innovationHub.tagline ?? ''}
        />
      }
      breadcrumbs={<TopLevelPageBreadcrumbs />}
    >
      <PageContent>
        <PageContentBlock sx={{ position: 'relative', paddingRight: gutters(2) }}>
          {innovationHub.settingsUrl && (
            <IconButton
              component={RouterLink}
              to={innovationHub.settingsUrl}
              size="small"
              aria-label={t('common.settings')}
              sx={{ position: 'absolute', top: gutters(0.5), right: gutters(0.5) }}
            >
              <SettingsOutlined />
            </IconButton>
          )}
          <WrapperMarkdown>{innovationHub.description ?? ''}</WrapperMarkdown>
        </PageContentBlock>
        <PageContentBlock>
          <PageContentBlockHeader title={t('innovationHub.selectedSpaces', { space: innovationHub.displayName })} />
          <ScrollableCardsLayoutContainer orientation="horizontal" cards={true}>
            {allSpaces?.map(space => (
              <SpaceCard
                key={space.id}
                banner={space.about.profile.cardBanner}
                displayName={space.about.profile.displayName!}
                tagline={space.about.profile.tagline ?? ''}
                tags={space.about.profile.tagset?.tags ?? []}
                spaceUri={space.about.profile.url}
                spaceVisibility={space.visibility}
                spaceId={space.id}
                level={space.level}
                avatarUris={collectSubspaceAvatars(space)}
                leadUsers={space.about.membership?.leadUsers}
                leadOrganizations={space.about.membership?.leadOrganizations}
                showLeads={isAuthenticated}
                isPrivate={!space.about.isContentPublic}
                onContactLead={handleContactLead}
              />
            ))}
          </ScrollableCardsLayoutContainer>
        </PageContentBlock>
        <PageContentBlock disablePadding={true}>
          <Gutters
            row={true}
            flexGrow={1}
            minHeight={gutters(4)}
            component={RouterLink}
            to={mainHomeUrl}
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
            rowGap={0}
          >
            <Logo />
            <BlockTitle paddingY={gutters()}>{t('innovationHub.goToMainPage')}</BlockTitle>
          </Gutters>
        </PageContentBlock>
      </PageContent>
      {directMessageDialog}
    </TopLevelLayout>
  );
};

export default InnovationHubHomePage;
