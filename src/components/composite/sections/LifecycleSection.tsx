import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Lifecycle } from '../../../models/graphql-schema';
import DashboardGenericSection from '../../../domain/shared/components/DashboardSections/DashboardGenericSection';
import LifecycleState from '../entities/Lifecycle/LifecycleState';

export interface LifecycleSectionProps {
  lifecycle?: Pick<Lifecycle, 'machineDef' | 'state'>;
}

const LifecycleSection: FC<LifecycleSectionProps> = ({ lifecycle }) => {
  const { t } = useTranslation();
  return (
    <DashboardGenericSection headerText={t('common.lifecycle')}>
      <LifecycleState lifecycle={lifecycle} />
    </DashboardGenericSection>
  );
};
export default LifecycleSection;
