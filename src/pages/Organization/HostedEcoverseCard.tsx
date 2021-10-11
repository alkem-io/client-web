import React, { FC } from 'react';
import CardProps from './CardProps';
import { useEcoverseCardQuery } from '../../hooks/generated/graphql';
import EcoverseCard from '../../components/composite/entities/Ecoverse/EcoverseCard';
import Loading from '../../components/core/Loading/Loading';
import { buildEcoverseUrl } from '../../utils/urlBuilders';
import { useUserContext } from '../../hooks';

const HostedEcoverseCard: FC<CardProps> = ({ id }) => {
  const { user } = useUserContext();
  const { data } = useEcoverseCardQuery({
    variables: {
      ecoverseId: id,
    },
  });

  const ecoverse = data?.ecoverse;
  const anonymousReadAccess = ecoverse?.authorization?.anonymousReadAccess;

  if (!ecoverse) {
    return <Loading text="" />;
  }

  return (
    <EcoverseCard
      id={ecoverse.id}
      displayName={ecoverse.displayName}
      activity={ecoverse.activity || []}
      context={{
        tagline: ecoverse.context?.tagline || '',
        visual: {
          background: ecoverse.context?.visual?.background || '',
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
};
export default HostedEcoverseCard;
