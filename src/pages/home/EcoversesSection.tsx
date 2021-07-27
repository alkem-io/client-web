import React, { useMemo } from 'react';
import { Col } from 'react-bootstrap';
import { CardContainer } from '../../components/core/Container';
import Loading from '../../components/core/Loading';
import EcoverseCard from '../../components/Ecoverse/EcoverseCard';
import ErrorBlock from '../../components/core/ErrorBlock';
import { useUserContext } from '../../hooks';
import { useUpdateNavigation } from '../../hooks';
import { useEcoversesWithActivityQuery } from '../../generated/graphql';

const EcoversesSection = () => {
  const { user } = useUserContext();
  const { data, loading, error } = useEcoversesWithActivityQuery();
  const ecoverses = data?.ecoverses || [];

  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

  return (
    <>
      {loading ? (
        <Loading text={'Loading ecoverses'} />
      ) : error ? (
        <Col xs={12}>
          <ErrorBlock blockName="Ecoverses" />
        </Col>
      ) : (
        <CardContainer>
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
                url={`/${ecoverse.nameID}`}
              />
            );
          })}
        </CardContainer>
      )}
    </>
  );
};

export default EcoversesSection;
