import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLoginSection from '../../domain/shared/components/DashboardSections/DashboardLoginSection';

const LoginSection = () => {
  const { t } = useTranslation();

  return (
    <DashboardLoginSection
      infomationText={t('pages.home.sections.welcome.join')}
      actionText={t('authentication.sign-in')}
    />
  );
};

export default LoginSection;
