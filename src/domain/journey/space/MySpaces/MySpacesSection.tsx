import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardSpacesSection from '../../../shared/components/DashboardSections/DashboardSpacesSection';
import { useUserSpacesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../../core/ui/loading/Loading';

const MySpacesSection = () => {
  const { t } = useTranslation();

  const { data: userSpacesData, loading: areUserSpacesLoading } = useUserSpacesQuery();

  const spaces = userSpacesData?.me.spaceMemberships ?? [];

  if (areUserSpacesLoading) {
    return <Loading />;
  }

  if (spaces.length === 0) {
    return null;
  }

  return (
    <DashboardSpacesSection
      headerText={t('pages.home.sections.my-spaces.header', { mySpacesCount: spaces.length })}
      spaces={spaces ?? []}
    />
  );
};

export default MySpacesSection;
