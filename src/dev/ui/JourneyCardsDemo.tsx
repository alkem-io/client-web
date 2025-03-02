import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { GUTTER_MUI } from '@/core/ui/grid/constants';
import { BlockTitle, PageTitle, Text } from '@/core/ui/typography';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import SpaceCard from '@/domain/journey/space/SpaceCard/SpaceCard';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import SpaceSubspaceCard from '@/domain/journey/space/SpaceSubspaceCard/SpaceSubspaceCard';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import SubspaceCard from '@/domain/journey/subspace/subspaceCard/SubspaceCard';
import UserCard from '@/domain/community/user/userCard/UserCard';

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const JourneyCardsDemo = () => {
  return (
    <>
      <PageTitle textAlign="center" paddingY={GUTTER_MUI}>
        Journey Cards Demo
      </PageTitle>
      <PageContent>
        <PageContentColumn columns={3}>
          <PageContentBlock accent>
            <BlockTitle>Journey Cards</BlockTitle>
            <Text>{loremIpsum}</Text>
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={9}>
          <PageContentBlock>
            <PageContentBlockHeader title="Explore Spaces Cards" />
            <PageContentBlockGrid disablePadding cards>
              <SpaceSubspaceCard
                banner={{ uri: '/src/domain/journey/defaultVisuals/Card.jpg' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Challenge Card"
                tags={['challenge', 'card']}
                journeyUri=""
                spaceDisplayName="Parent Space"
                spaceUri=""
                level={SpaceLevel.L1}
                avatarUris={['', '']}
                locked
              />
              <SpaceSubspaceCard
                banner={{ uri: '/src/domain/journey/defaultVisuals/Card.jpg' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Really Long Challenge Card Display Name"
                tags={['challenge', 'card']}
                journeyUri=""
                spaceDisplayName=""
                spaceUri=""
                level={SpaceLevel.L0}
                isPrivate
                avatarUris={['']}
              />
              <SpaceSubspaceCard
                banner={{ uri: '/src/domain/journey/defaultVisuals/Card.jpg' }}
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
                member
                journeyUri=""
                spaceDisplayName="Parent Space"
                spaceUri=""
                level={SpaceLevel.L2}
                avatarUris={['', '', '']}
              />
            </PageContentBlockGrid>
          </PageContentBlock>
          <PageContentBlock>
            <PageContentBlockHeader title="User Cards" />
            <PageContentBlockGrid disablePadding cards>
              <UserCard
                avatarSrc="https://alkem.io/api/private/rest/storage/document/0e228032-f3ab-4dec-9cd1-01d8a6e3ef2b"
                displayName="Emilia Pavlova"
                roleName="Admin"
                city="Sofia"
                country="Bulgaria"
                tags={['dreamer', 'nonpractical']}
              />
              <UserCard
                avatarSrc="http://localhost:3000/api/private/rest/storage/document/fc346b8b-3e89-4c74-ad71-ca26910952ed"
                displayName="Test User"
                isContactable={false}
              />
            </PageContentBlockGrid>
          </PageContentBlock>
          <PageContentBlock>
            <PageContentBlockHeader title="Space Cards" />
            <PageContentBlockGrid disablePadding cards>
              <SpaceCard
                banner={{ uri: '/alkemio-banner/default-banner.png' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Space Card"
                tags={['space', 'card']}
                membersCount={20}
                journeyUri=""
              />
              <SpaceCard
                banner={{ uri: '/alkemio-banner/default-banner.png' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Space Card"
                tags={['space', 'card']}
                membersCount={20}
                journeyUri=""
              />
              <SpaceCard
                banner={{ uri: '/alkemio-banner/default-banner.png' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Space Card"
                tags={['space', 'card', 'that', 'has', 'too', 'many', 'tags', 'they', 'dont even fit', 'on 2 lines']}
                membersCount={20}
                journeyUri=""
              />
            </PageContentBlockGrid>
          </PageContentBlock>
          <PageContentBlock>
            <PageContentBlockHeader title="Challenge Cards" />
            <PageContentBlockGrid disablePadding cards>
              <SubspaceCard
                banner={{ uri: '/alkemio-banner/default-banner.png' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Challenge Card"
                tags={['challenge', 'card']}
                innovationFlowState="Innovation Flow State"
                journeyUri=""
                spaceDisplayName="Parent Space"
                spaceUri=""
              />
              <SubspaceCard
                banner={{ uri: '/alkemio-banner/default-banner.png' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Really Long Challenge Card Display Name"
                tags={['challenge', 'card']}
                innovationFlowState="Innovation Flow State"
                journeyUri=""
                spaceDisplayName="Parent Space"
                spaceUri=""
              />
              <SubspaceCard
                banner={{ uri: '/alkemio-banner/default-banner.png' }}
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
                spaceDisplayName="Parent Space"
                spaceUri=""
              />
            </PageContentBlockGrid>
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
    </>
  );
};

export default JourneyCardsDemo;
