import Grid from '@material-ui/core/Grid';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CardContainer } from '../../components/core/CardContainer';
import ErrorBlock from '../../components/core/ErrorBlock';
import Loading from '../../components/core/Loading/Loading';
import EcoverseCard from '../../components/composite/entities/Ecoverse/EcoverseCard';
import { useUpdateNavigation, useUserContext } from '../../hooks';
import { useEcoversesQuery } from '../../hooks/generated/graphql';
import { buildEcoverseUrl } from '../../utils/urlBuilders';

const EcoversesSection = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const { data: ecoversesData, loading, error } = useEcoversesQuery({ fetchPolicy: 'cache-and-network' });
  const ecoverses = useMemo(() => ecoversesData?.ecoverses || [], [ecoversesData]);

  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

  return (
    <>
      {loading ? (
        <Loading text={t('components.loading.message', { blockName: t('common.ecoverses') })} />
      ) : error ? (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ErrorBlock blockName={t('common.ecoverse')} />
          </Grid>
        </Grid>
      ) : (
        <CardContainer cardHeight={520}>
          {ecoverses.map((ecoverse, i) => {
            const anonymousReadAccess = ecoverse?.authorization?.anonymousReadAccess;
            return (
              <EcoverseCard
                key={i}
                id={ecoverse.id}
                displayName={ecoverse.displayName}
                activity={ecoverse?.activity || []}
                context={{
                  tagline: ecoverse?.context?.tagline || '',
                  visual: {
                    background: ecoverse?.context?.visual?.background || '',
                  },
                }}
                authorization={{
                  anonymousReadAccess: anonymousReadAccess != null ? anonymousReadAccess : true,
                }}
                isMember={user?.ofEcoverse(ecoverse.id) || false}
                tags={ecoverse?.tagset?.tags || []}
                url={buildEcoverseUrl(ecoverse.nameID)}
              />
            );
          })}
        </CardContainer>
      )}
    </>
  );
};

export default EcoversesSection;
