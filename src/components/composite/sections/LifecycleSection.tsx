import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Lifecycle as LifecycleModel } from '../../../models/graphql-schema';
import DashboardGenericSection from '../common/sections/DashboardGenericSection';
import LifecycleState from '../entities/Lifecycle/LifecycleState';

export interface LifecycleSectionProps {
  lifecycle?: LifecycleModel;
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
