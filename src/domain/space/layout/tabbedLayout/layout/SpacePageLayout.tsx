// import { EntityPageLayout } from '@/domain/space/layout/EntityPageLayout';
// import SpaceTabs, { SpaceTabsPlaceholder } from '../Tabs/SpaceTabs';
// import { PropsWithChildren } from 'react';
// import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
// import SpaceBreadcrumbs from '@/domain/space/components/spaceBreadcrumbs/SpaceBreadcrumbs';
// import useInnovationHubJourneyBannerRibbon from '@/domain/innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
// import SpacePageBanner from './SpacePageBanner';
// import { JourneyPath } from '@/main/routing/urlResolver/UrlResolverProvider';
// import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
// import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
// import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';

// export interface SpacePageLayoutProps {
//   currentSection: { sectionIndex: number } | { section: EntityPageSection } | undefined;
//   journeyPath: JourneyPath | undefined;
//   loading?: boolean;
// }

// const SpacePageLayout = ({
//   currentSection,
//   journeyPath,
//   loading = false,
//   children,
// }: PropsWithChildren<SpacePageLayoutProps>) => {
//   const { spaceId, loading: resolving } = useUrlResolver();

//   const { data: spaceData } = useSpaceAboutDetailsQuery({
//     variables: {
//       spaceId: spaceId!,
//     },
//     skip: !spaceId || loading,
//   });

//   const profile = spaceData?.lookup.space?.about.profile;

//   const ribbon = useInnovationHubJourneyBannerRibbon({
//     spaceId,
//   });

//   return (
//     <EntityPageLayout
//       currentSection={currentSection}
//       breadcrumbs={<SpaceBreadcrumbs journeyPath={journeyPath} />}
//       pageBanner={
//         <SpacePageBanner
//           title={profile?.displayName}
//           tagline={profile?.tagline}
//           loading={loading || resolving}
//           bannerUrl={profile?.banner?.uri}
//           bannerAltText={profile?.banner?.alternativeText}
//           ribbon={ribbon}
//         />
//       }
//       tabsComponent={loading ? SpaceTabsPlaceholder : SpaceTabs}
//     >
//       <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
//         {children}
//       </StorageConfigContextProvider>
//     </EntityPageLayout>
//   );
// };

// export default SpacePageLayout;
