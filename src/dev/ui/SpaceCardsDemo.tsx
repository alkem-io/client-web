import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { GUTTER_MUI } from '@/core/ui/grid/constants';
import { BlockTitle, PageTitle, Text } from '@/core/ui/typography';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import SubspaceCard from '@/domain/space/components/cards/SubspaceCard';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import UserCard from '@/domain/community/user/userCard/UserCard';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const SpaceCardsDemo = () => {
  return (
    <>
      <PageTitle textAlign="center" paddingY={GUTTER_MUI}>
        Space Cards Demo
      </PageTitle>
      <PageContent>
        <PageContentColumn columns={3}>
          <PageContentBlock accent>
            <BlockTitle>Space Cards</BlockTitle>
            <Text>{loremIpsum}</Text>
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={9}>
          <PageContentBlock>
            <PageContentBlockHeader title="Explore Spaces Cards" />
            <PageContentBlockGrid disablePadding cards>
              <SubspaceCard
                banner={{ uri: getDefaultSpaceVisualUrl(VisualType.Card) }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Space L1 Card"
                tags={['subspace', 'card']}
                spaceUri=""
                spaceDisplayName="Parent Space"
                level={SpaceLevel.L1}
                avatarUris={[
                  { src: '', alt: 'Member avatar' },
                  { src: '', alt: 'Member avatar' },
                ]}
                locked
              />
              <SubspaceCard
                banner={{ uri: getDefaultSpaceVisualUrl(VisualType.Card) }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Really Long Subspace Card Display Name"
                tags={['subspace', 'card']}
                spaceUri=""
                spaceDisplayName=""
                level={SpaceLevel.L0}
                isPrivate
                avatarUris={[{ src: '', alt: 'Member avatar' }]}
              />
              <SubspaceCard
                banner={{ uri: getDefaultSpaceVisualUrl(VisualType.Card) }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Really Long Subspace Card Display Name That Doesn't Even Fit On 2 Lines"
                tags={['subspace', 'card', 'that', 'has', 'too', 'many', 'tags', 'they', 'dont even fit', 'on 2 lines']}
                member
                spaceUri=""
                spaceDisplayName="Parent Space"
                level={SpaceLevel.L2}
                avatarUris={[
                  { src: '', alt: 'Member avatar' },
                  { src: '', alt: 'Member avatar' },
                  { src: '', alt: 'Member avatar' },
                ]}
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
              <SubspaceCard
                banner={{ uri: '/alkemio-banner/default-banner.png' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Space Card"
                tags={['space', 'card']}
                spaceUri=""
                level={SpaceLevel.L0}
              />
              <SubspaceCard
                banner={{ uri: '/alkemio-banner/default-banner.png' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Space Card"
                tags={['space', 'card']}
                spaceUri=""
                level={SpaceLevel.L0}
              />
              <SubspaceCard
                banner={{ uri: '/alkemio-banner/default-banner.png' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Space Card"
                tags={['space', 'card', 'that', 'has', 'too', 'many', 'tags', 'they', 'dont even fit', 'on 2 lines']}
                spaceUri=""
                level={SpaceLevel.L0}
              />
            </PageContentBlockGrid>
          </PageContentBlock>
          <PageContentBlock>
            <PageContentBlockHeader title="Subspace Cards" />
            <PageContentBlockGrid disablePadding cards>
              <SubspaceCard
                banner={{ uri: '/alkemio-banner/default-banner.png' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Subspace Card"
                tags={['subspace', 'card']}
                spaceUri=""
                spaceDisplayName="Parent Space"
              />
              <SubspaceCard
                banner={{ uri: '/alkemio-banner/default-banner.png' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Really Long Subspace Card Display Name"
                tags={['subspace', 'card']}
                spaceUri=""
                spaceDisplayName="Parent Space"
              />
              <SubspaceCard
                banner={{ uri: '/alkemio-banner/default-banner.png' }}
                tagline={loremIpsum}
                vision={loremIpsum}
                displayName="Really Long Subspace Card Display Name That Doesn't Even Fit On 2 Lines"
                tags={['subspace', 'card', 'that', 'has', 'too', 'many', 'tags', 'they', 'dont even fit', 'on 2 lines']}
                spaceUri=""
                spaceDisplayName="Parent Space"
              />
            </PageContentBlockGrid>
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
    </>
  );
};

export default SpaceCardsDemo;
