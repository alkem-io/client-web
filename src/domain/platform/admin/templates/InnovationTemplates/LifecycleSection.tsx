import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Lifecycle } from '../../../../../core/apollo/generated/graphql-schema';
import DashboardGenericSection from '../../../../shared/components/DashboardSections/DashboardGenericSection';
import InnovationFlow from './InnovationFlow/InnovationFlow';

export interface LifecycleSectionProps {
  lifecycle?: Pick<Lifecycle, 'machineDef' | 'state'>;
}

const LifecycleSection: FC<LifecycleSectionProps> = ({ lifecycle }) => {
  const { t } = useTranslation();
  return (
    <DashboardGenericSection headerText={t('common.lifecycle')}>
      <InnovationFlow lifecycle={lifecycle} />
    </DashboardGenericSection>
  );
};

export default LifecycleSection;
