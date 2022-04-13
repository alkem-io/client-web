import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardSection from '../../sections/DashboardSection/DashboardSection';
import AspectCard, { AspectCardAspect } from '../../common/cards/AspectCard/AspectCard';
import { CardLayoutContainer, CardLayoutItem } from '../../../core/CardLayoutContainer/CardLayoutContainer';

interface DashboardSectionAspectsProps {
  aspects: AspectCardAspect[];
  aspectsCount?: number;
  hubNameId?: string;
  challengeNameId?: string;
  opportunityNameId?: string;
}

const DashboardSectionAspects: FC<DashboardSectionAspectsProps> = ({ aspects, aspectsCount, ...parentEntityIds }) => {
  const { t } = useTranslation();

  const headerText =
    typeof aspectsCount === 'undefined' ? t('common.aspects') : `${t('common.aspects')} (${aspectsCount})`;

  return (
    <DashboardSection headerText={headerText} navText={t('buttons.see-all')} navLink="contribute">
      <CardLayoutContainer>
        {aspects.map(aspect => (
          <CardLayoutItem key={aspect.id}>
            <AspectCard aspect={aspect} {...parentEntityIds} />
          </CardLayoutItem>
        ))}
      </CardLayoutContainer>
    </DashboardSection>
  );
};

export default DashboardSectionAspects;
