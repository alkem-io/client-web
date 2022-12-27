import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardSection from '../../../../common/components/composite/sections/DashboardSection/DashboardSection';
import AspectCard, { AspectCardAspect } from '../AspectCard/AspectCard';
import CardsLayout from '../../../../core/ui/card/CardsLayout/CardsLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';

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

  if (aspects.length === 0) {
    return null;
  }

  return (
    <DashboardSection headerText={headerText} navText={t('buttons.see-all')} navLink={EntityPageSection.Contribute}>
      <CardsLayout
        items={aspects}
        deps={[parentEntityIds.hubNameId, parentEntityIds.challengeNameId, parentEntityIds.opportunityNameId]}
      >
        {aspect => <AspectCard aspect={aspect} {...parentEntityIds} keepScroll />}
      </CardsLayout>
    </DashboardSection>
  );
};

export default DashboardSectionAspects;
