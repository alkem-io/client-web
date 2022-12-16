import PageContent from '../../core/ui/content/PageContent';
import PageContentColumn from '../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../core/ui/content/PageContentBlock';
import GridItem, { GridItemProps } from '../../core/ui/grid/GridItem';
import { Box } from '@mui/material';
import { GUTTER_MUI, GUTTER_PX } from '../../core/ui/grid/constants';
import { BlockTitle, PageTitle, Text } from '../../core/ui/typography';
import PageContentBlockGrid from '../../core/ui/content/PageContentBlockGrid';
import HubCard from '../../domain/challenge/hub/HubCard/HubCard';
import ChallengeCard from '../../domain/challenge/challenge/ChallengeCard/ChallengeCard';

const DummyContent = (props: GridItemProps) => (
  <GridItem {...props}>
    <Box height={10 * GUTTER_PX} sx={{ backgroundColor: 'background.default' }} />
  </GridItem>
);

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const JourneyCardsDemo = () => {
  return (
    <>
      <PageTitle textAlign="center" paddingY={GUTTER_MUI}>
        Journey Cards Demo
      </PageTitle>
      <PageContent>
        <PageContentColumn columns={4}>
          <PageContentBlock accent>
            <BlockTitle>Journey Cards</BlockTitle>
            <Text>{loremIpsum}</Text>
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={8}>
          <PageContentBlock disableGap disablePadding>
            <PageContentBlockGrid cards>
              <HubCard
                bannerUri={'/alkemio-banner/default-banner.png'}
                tagline={loremIpsum}
                displayName="Hub Card"
                tags={['hub', 'card']}
                membersCount={20}
              />
              <ChallengeCard
                bannerUri={'/alkemio-banner/default-banner.png'}
                tagline={loremIpsum}
                displayName="Challenge Card"
                tags={['challenge', 'card']}
              />
              <ChallengeCard
                bannerUri={'/alkemio-banner/default-banner.png'}
                tagline={loremIpsum}
                displayName="Really Long Challenge Card Display Name"
                tags={['challenge', 'card']}
              />
              <DummyContent columns={3} />
              <DummyContent columns={3} />
              <DummyContent columns={3} />
              <DummyContent columns={3} />
            </PageContentBlockGrid>
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
    </>
  );
};

export default JourneyCardsDemo;
