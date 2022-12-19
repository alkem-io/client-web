import PageContent from '../../core/ui/content/PageContent';
import PageContentColumn from '../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../core/ui/content/PageContentBlock';
import { GUTTER_MUI } from '../../core/ui/grid/constants';
import { BlockTitle, PageTitle, Text } from '../../core/ui/typography';
import PageContentBlockGrid from '../../core/ui/content/PageContentBlockGrid';
import HubCard from '../../domain/challenge/hub/HubCard/HubCard';
import ChallengeCard from '../../domain/challenge/challenge/ChallengeCard/ChallengeCard';
import PageContentBlockHeader from '../../core/ui/content/PageContentBlockHeader';
import OpportunityCard from '../../domain/challenge/opportunity/OpportunityCard/OpportunityCard';

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
          <PageContentBlock>
            <PageContentBlockHeader title="Hub Cards" />
            <PageContentBlockGrid disablePadding cards>
              <HubCard
                bannerUri={'/alkemio-banner/default-banner.png'}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Hub Card"
                tags={['hub', 'card']}
                membersCount={20}
                journeyUri=""
              />
              <HubCard
                bannerUri={'/alkemio-banner/default-banner.png'}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Hub Card"
                tags={['hub', 'card']}
                membersCount={20}
                journeyUri=""
              />
              <HubCard
                bannerUri={'/alkemio-banner/default-banner.png'}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Hub Card"
                tags={['hub', 'card', 'that', 'has', 'too', 'many', 'tags', 'they', 'dont even fit', 'on 2 lines']}
                membersCount={20}
                journeyUri=""
              />
            </PageContentBlockGrid>
          </PageContentBlock>
          <PageContentBlock>
            <PageContentBlockHeader title="Challenge Cards" />
            <PageContentBlockGrid disablePadding cards>
              <ChallengeCard
                bannerUri={'/alkemio-banner/default-banner.png'}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Challenge Card"
                tags={['challenge', 'card']}
                innovationFlowState="Innovation Flow State"
                journeyUri=""
                hubDisplayName="Parent Hub"
                hubUri=""
              />
              <ChallengeCard
                bannerUri={'/alkemio-banner/default-banner.png'}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Really Long Challenge Card Display Name"
                tags={['challenge', 'card']}
                innovationFlowState="Innovation Flow State"
                journeyUri=""
                hubDisplayName="Parent Hub"
                hubUri=""
              />
              <ChallengeCard
                bannerUri={'/alkemio-banner/default-banner.png'}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Really Long Challenge Card Display Name That Doesn't Even Fit On 2 Lines"
                tags={[
                  'challenge',
                  'card',
                  'that',
                  'has',
                  'too',
                  'many',
                  'tags',
                  'they',
                  'dont even fit',
                  'on 2 lines',
                ]}
                innovationFlowState="Innovation Flow State"
                journeyUri=""
                hubDisplayName="Parent Hub"
                hubUri=""
              />
            </PageContentBlockGrid>
          </PageContentBlock>
          <PageContentBlock>
            <PageContentBlockHeader title="Opportunity Cards" />
            <PageContentBlockGrid disablePadding cards>
              <OpportunityCard
                bannerUri={'/alkemio-banner/default-banner.png'}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Opportunity Card"
                tags={['opportunity', 'card']}
                innovationFlowState="Innovation Flow State"
                journeyUri=""
                challengeDisplayName="Parent Challenge"
                challengeUri=""
              />
              <OpportunityCard
                bannerUri={'/alkemio-banner/default-banner.png'}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Really Long Opportunity Card Display Name"
                tags={['opportunity', 'card']}
                innovationFlowState="Innovation Flow State"
                journeyUri=""
                challengeDisplayName="Parent Challenge"
                challengeUri=""
              />
              <OpportunityCard
                bannerUri={'/alkemio-banner/default-banner.png'}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Really Long Opportunity Card Display Name That Doesn't Even Fit On 2 Lines"
                tags={[
                  'opportunity',
                  'card',
                  'that',
                  'has',
                  'too',
                  'many',
                  'tags',
                  'they',
                  'dont even fit',
                  'on 2 lines',
                ]}
                innovationFlowState="Innovation Flow State"
                journeyUri=""
                challengeDisplayName="Parent Challenge"
                challengeUri=""
              />
            </PageContentBlockGrid>
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
    </>
  );
};

export default JourneyCardsDemo;
