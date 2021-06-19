import React, { useMemo } from 'react';
import { Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { CardContainer } from '../../components/core/Container';
import Loading from '../../components/core/Loading';
import EcoverseCard from '../../components/Ecoverse/EcoverseCard';
import ErrorBlock from '../../components/core/ErrorBlock';
import { useUserContext } from '../../hooks/useUserContext';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { useEcoversesContext } from '../../hooks/useEcoversesContext';

const EcoversesSection = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const { ecoverses, loading, error } = useEcoversesContext();

  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

  return (
    <React.Fragment>
      {loading ? (
        <Loading text={'Loading ecoverses'} />
      ) : error ? (
        <Col xs={12}>
          <ErrorBlock blockName={t('pages.home.sections.ecoverse.header')} />
        </Col>
      ) : (
        <CardContainer cardHeight={320} xs={12} md={6} lg={4} xl={3}>
          {ecoverses.map((ecoverse, i) => (
            <EcoverseCard
              key={i}
              id={ecoverse.id}
              name={ecoverse.displayName}
              context={{
                tag: user?.ofEcoverse(ecoverse.id) ? t('components.card.you-are-in') : '',
                tagline: ecoverse?.context?.tagline || '',
                references: ecoverse?.context?.references,
              }}
              url={`/ecoverses/${ecoverse.nameID}`}
            />
          ))}
        </CardContainer>
      )}
    </React.Fragment>
  );
};

export default EcoversesSection;
