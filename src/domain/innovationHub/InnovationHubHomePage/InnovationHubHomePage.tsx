import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { InnovationHubAttrs } from './InnovationHubAttrs';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockTitle } from '@/core/ui/typography';
import Logo from '@/main/ui/logo/logoSmall.svg?react';
import { gutters } from '@/core/ui/grid/utils';
import InnovationHubBanner from './InnovationHubBanner';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { useDashboardSpacesQuery } from '@/core/apollo/generated/apollo-hooks';
import { CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import RouterLink from '@/core/ui/link/RouterLink';
import Gutters from '@/core/ui/grid/Gutters';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { useConfig } from '@/domain/platform/config/useConfig';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { collectSubspaceAvatars } from '@/domain/space/components/cards/utils/useSubspaceCardData';

const isMember = (about: { membership?: { myMembershipStatus?: CommunityMembershipStatus } }) =>
  about.membership?.myMembershipStatus === CommunityMembershipStatus.Member;

const InnovationHubHomePage = ({ innovationHub }: { innovationHub: InnovationHubAttrs }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useCurrentUserContext();

  const { data: spacesData } = useDashboardSpacesQuery();

  const allSpaces = spacesData?.spaces;

  const { locations } = useConfig();

  const mainHomeUrl = `//${locations?.domain}${ROUTE_HOME}`;

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
        <PageContentBlock>
          <WrapperMarkdown>{innovationHub.description ?? ''}</WrapperMarkdown>
        </PageContentBlock>
        <PageContentBlock>
          <PageContentBlockHeader title={t('innovationHub.selectedSpaces', { space: innovationHub.displayName })} />
          <ScrollableCardsLayoutContainer orientation="horizontal" cards>
            {allSpaces?.map(space => (
              <SpaceCard
                key={space.id}
                banner={space.about.profile.cardBanner}
                displayName={space.about.profile.displayName!}
                tagline={space.about.profile.tagline ?? ''}
                tags={space.about.profile.tagset?.tags ?? []}
                spaceUri={space.about.profile.url}
                member={isMember(space.about)}
                spaceVisibility={space.visibility}
                spaceId={space.id}
                level={space.level}
                avatarUris={collectSubspaceAvatars(space)}
                leadUsers={space.about.membership?.leadUsers}
                leadOrganizations={space.about.membership?.leadOrganizations}
                showLeads={isAuthenticated}
              />
            ))}
          </ScrollableCardsLayoutContainer>
        </PageContentBlock>
        <PageContentBlock disablePadding>
          <Gutters
            row
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
    </TopLevelLayout>
  );
};

export default InnovationHubHomePage;
