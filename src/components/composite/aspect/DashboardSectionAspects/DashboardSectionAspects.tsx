import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardSection from '../../sections/DashboardSection/DashboardSection';
import AspectCard, { AspectCardAspect } from '../../common/cards/AspectCard/AspectCard';
import { CardLayoutContainer, CardLayoutItem } from '../../../core/CardLayoutContainer/CardLayoutContainer';

interface DashboardSectionAspectsProps {
  aspects: AspectCardAspect[];
  hubNameId?: string;
  challengeNameId?: string;
  opportunityNameId?: string;
}

const DashboardSectionAspects: FC<DashboardSectionAspectsProps> = ({ aspects, ...parentEntityIds }) => {
  const { t } = useTranslation();

  return (
    <DashboardSection
      headerText={`${t('common.aspects')} (${aspects.length})`}
      navText={t('buttons.see-all')}
      navLink="contribute"
    >
      <CardLayoutContainer>
        {aspects.slice(0, 2).map(aspect => (
          <CardLayoutItem key={aspect.id}>
            <AspectCard aspect={aspect} {...parentEntityIds} />
          </CardLayoutItem>
        ))}
      </CardLayoutContainer>
    </DashboardSection>
  );
};

export default DashboardSectionAspects;
