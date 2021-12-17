import Typography from '@mui/material/Typography/Typography';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardHubSection from '../../components/composite/common/sections/DashboardHubSection';
import { SectionSpacer } from '../../components/core/Section/Section';
import { useUserContext } from '../../hooks';
import { useEcoversesQuery } from '../../hooks/generated/graphql';

// const EcoversesSection = () => {
//   const { t } = useTranslation();
//   const { user } = useUserContext();
//   const { data: ecoversesData, loading, error } = useEcoversesQuery({ fetchPolicy: 'cache-and-network' });
//   const ecoverses = useMemo(() => ecoversesData?.ecoverses || [], [ecoversesData]);

//   const currentPaths = useMemo(() => [], []);
//   useUpdateNavigation({ currentPaths });

//   return (
//     <>
//       {loading ? (
//         <Loading text={t('components.loading.message', { blockName: t('common.ecoverses') })} />
//       ) : error ? (
//         <Grid container spacing={2}>
//           <Grid item xs={12}>
//             <ErrorBlock blockName={t('common.ecoverse')} />
//           </Grid>
//         </Grid>
//       ) : (
//         <CardContainer cardHeight={520}>
//           {ecoverses.map((ecoverse, i) => {
//             const anonymousReadAccess = ecoverse?.authorization?.anonymousReadAccess;
//             return (
//               <EcoverseCard
//                 key={i}
//                 id={ecoverse.id}
//                 displayName={ecoverse.displayName}
//                 activity={ecoverse?.activity || []}
//                 context={{
//                   tagline: ecoverse?.context?.tagline || '',
//                   visual: {
//                     background: ecoverse?.context?.visual?.background || '',
//                   },
//                 }}
//                 authorization={{
//                   anonymousReadAccess: anonymousReadAccess != null ? anonymousReadAccess : true,
//                 }}
//                 isMember={user?.ofEcoverse(ecoverse.id) || false}
//                 tags={ecoverse?.tagset?.tags || []}
//                 url={buildEcoverseUrl(ecoverse.nameID)}
//               />
//             );
//           })}
//         </CardContainer>
//       )}
//     </>
//   );
// };

const EcoverseSectionV2 = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const { data: ecoversesData, loading } = useEcoversesQuery({ fetchPolicy: 'cache-and-network' });
  const ecoverses = useMemo(() => ecoversesData?.ecoverses || [], [ecoversesData]);

  return (
    <DashboardHubSection
      headerText={t('pages.home.sections.hub.header')}
      subHeaderText={t('pages.home.sections.hub.subheader')}
      entities={{
        hubs: ecoverses,
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

export default EcoverseSectionV2;
