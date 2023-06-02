import BasePageLayout from '../../../challenge/common/BaseLayout/EntityPageLayout';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { InnovationHubAttrs } from './InnovationHubAttrs';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { BlockTitle } from '../../../../core/ui/typography';
import { ReactComponent as Logo } from '../../Logo/Logo-Small.svg';
import { gutters } from '../../../../core/ui/grid/utils';
import InnovationHubBanner from './InnovationHubBanner';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayoutContainer';
import { useHomePageSpacesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';
import HubCard from '../../../challenge/hub/HubCard/HubCard';
import getMetricCount from '../../metrics/utils/getMetricCount';
import { MetricType } from '../../metrics/MetricType';
import { buildHubUrl } from '../../../../common/utils/urlBuilders';
import RouterLink from '../../../../core/ui/link/RouterLink';
import Gutters from '../../../../core/ui/grid/Gutters';
import { ROUTE_HOME } from '../../routes/constants';
import { useConfig } from '../../config/useConfig';
import { useUserContext } from '../../../community/contributor/user';

interface InnovationHubHomePageProps {
  innovationHub: InnovationHubAttrs;
}

const isMember = (journey: { community?: { myMembershipStatus?: CommunityMembershipStatus } }) =>
  journey.community?.myMembershipStatus === CommunityMembershipStatus.Member;

const InnovationHubHomePage = ({ innovationHub }: InnovationHubHomePageProps) => {
  const { t } = useTranslation();

  const { isAuthenticated } = useUserContext();

  const { data: spacesData } = useHomePageSpacesQuery({
    variables: {
      includeMembershipStatus: isAuthenticated,
    },
  });

  const allSpaces = spacesData?.hubs;

  const userSpaces = spacesData?.hubs.filter(isMember);

  const { platform } = useConfig();

  const mainHomeUrl = `//${platform?.domain}${ROUTE_HOME}`;

  return (
    <BasePageLayout
      pageBanner={
        <InnovationHubBanner
          banner={innovationHub.banner}
          displayName={innovationHub.displayName}
          tagline={innovationHub.tagline}
        />
      }
    >
      <PageContent>
        <PageContentBlock>
          <WrapperMarkdown>{innovationHub.description ?? ''}</WrapperMarkdown>
        </PageContentBlock>
        <PageContentBlock>
          <PageContentBlockHeader title={t('innovationHub.selectedSpaces', { hub: innovationHub.displayName })} />
          <ScrollableCardsLayoutContainer orientation="horizontal" cards>
            {allSpaces?.map(space => (
              <HubCard
                banner={space.profile?.banner}
                displayName={space.profile?.displayName!}
                vision={space.context?.vision!}
                membersCount={getMetricCount(space.metrics, MetricType.Member)}
                tagline={space.profile?.tagline!}
                tags={space.profile?.tagset?.tags ?? []}
                journeyUri={buildHubUrl(space.nameID)}
                member={isMember(space)}
                hubVisibility={space.visibility}
              />
            ))}
          </ScrollableCardsLayoutContainer>
        </PageContentBlock>
        {userSpaces && userSpaces.length > 0 && (
          <PageContentBlock>
            <PageContentBlockHeader
              title={t('pages.home.sections.my-hubs.header', { myHubsCount: userSpaces.length })}
            />
            <ScrollableCardsLayoutContainer orientation="horizontal" cards>
              {userSpaces.map(space => (
                <HubCard
                  banner={space.profile?.banner}
                  displayName={space.profile?.displayName!}
                  vision={space.context?.vision!}
                  membersCount={getMetricCount(space.metrics, MetricType.Member)}
                  tagline={space.profile?.tagline!}
                  tags={space.profile?.tagset?.tags ?? []}
                  journeyUri={buildHubUrl(space.nameID)}
                />
              ))}
            </ScrollableCardsLayoutContainer>
          </PageContentBlock>
        )}
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
    </BasePageLayout>
  );
};

export default InnovationHubHomePage;
