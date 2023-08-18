import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardSpacesSection, {
  DashboardSpaceSectionProps,
} from '../../../shared/components/DashboardSections/DashboardSpacesSection';
import { useUserSpacesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../../core/ui/loading/Loading';

const MySpacesSection = () => {
  const { t } = useTranslation();

  const { data: userSpacesData, loading: areUserSpacesLoading } = useUserSpacesQuery();

  const spaces = userSpacesData?.me.spaceMemberships ?? [];

  // TODO other labels such as Lead etc.
  // const isLead = (spaceId: string) => spaceRolesBySpaceId[spaceId]?.roles.includes(USER_ROLE_HUB_LEAD);
  //
  const getSpaceCardProps: DashboardSpaceSectionProps['getSpaceCardProps'] = () => {
    return {
      // lead: isLead(space.id),
      member: false,
    };
  };

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
      getSpaceCardProps={getSpaceCardProps}
    />
  );
};

export default MySpacesSection;
