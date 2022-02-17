import Typography from '@mui/material/Typography/Typography';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardHubSection from '../../components/composite/common/sections/DashboardHubSection';
import { SectionSpacer } from '../../components/core/Section/Section';
import { useUserContext } from '../../hooks';
import { useHubsQuery } from '../../hooks/generated/graphql';

// const HubsSection = () => {
//   const { t } = useTranslation();
//   const { user } = useUserContext();
//   const { data: hubsData, loading, error } = useHubsQuery({ fetchPolicy: 'cache-and-network' });
//   const hubs = useMemo(() => hubsData?.hubs || [], [hubsData]);

//   const currentPaths = useMemo(() => [], []);
//   useUpdateNavigation({ currentPaths });

//   return (
//     <>
//       {loading ? (
//         <Loading text={t('components.loading.message', { blockName: t('common.hubs') })} />
//       ) : error ? (
//         <Grid container spacing={2}>
//           <Grid item xs={12}>
//             <ErrorBlock blockName={t('common.hub')} />
//           </Grid>
//         </Grid>
//       ) : (
//         <CardContainer cardHeight={520}>
//           {hubs.map((hub, i) => {
//             const anonymousReadAccess = hub?.authorization?.anonymousReadAccess;
//             return (
//               <HubCard
//                 key={i}
//                 id={hub.id}
//                 displayName={hub.displayName}
//                 activity={hub?.activity || []}
//                 context={{
//                   tagline: hub?.context?.tagline || '',
//                   visual: {
//                     background: hub?.context?.visual?.background || '',
//                   },
//                 }}
//                 authorization={{
//                   anonymousReadAccess: anonymousReadAccess != null ? anonymousReadAccess : true,
//                 }}
//                 isMember={user?.ofHub(hub.id) || false}
//                 tags={hub?.tagset?.tags || []}
//                 url={buildHubUrl(hub.nameID)}
//               />
//             );
//           })}
//         </CardContainer>
//       )}
//     </>
//   );
// };

const HubSectionV2 = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const { data: hubsData, loading } = useHubsQuery({ fetchPolicy: 'cache-and-network' });
  const hubs = useMemo(() => hubsData?.hubs || [], [hubsData]);

  return (
    <DashboardHubSection
      headerText={t('pages.home.sections.hub.header')}
      subHeaderText={t('pages.home.sections.hub.subheader')}
      entities={{
        hubs: hubs,
        user,
      }}
      options={{
        itemBasis: '25%',
      }}
      loading={{ hubs: loading }}
    >
      <Typography variant="body1">{t('pages.home.sections.hub.body')}</Typography>
      <SectionSpacer />
    </DashboardHubSection>
  );
};

export default HubSectionV2;
