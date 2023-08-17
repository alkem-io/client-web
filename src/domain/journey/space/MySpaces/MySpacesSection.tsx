import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { keyBy } from 'lodash';
import DashboardSpacesSection, {
  DashboardSpaceSectionProps,
} from '../../../shared/components/DashboardSections/DashboardSpacesSection';
import { useSpacesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../../core/ui/loading/Loading';
import { UserRolesInEntity } from '../../../community/user/providers/UserProvider/UserRolesInEntity';
import { SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';

interface MySpacesSectionProps {
  userSpaceRoles: UserRolesInEntity[] | undefined;
  loading?: boolean;
}

const MySpacesSection = ({ userSpaceRoles, loading }: MySpacesSectionProps) => {
  const { t } = useTranslation();

  const { data: spacesData, loading: areSpacesLoading } = useSpacesQuery({
    variables: { visibilities: [SpaceVisibility.Active, SpaceVisibility.Demo] },
  });

  const isLoading = loading || areSpacesLoading;

  const spaceRolesBySpaceId = useMemo(() => keyBy(userSpaceRoles, 'id'), [userSpaceRoles]);
  const spaces = useMemo(
    () => spacesData?.spaces.filter(({ id }) => spaceRolesBySpaceId[id]) ?? [],
    [spacesData, spaceRolesBySpaceId]
  );

  // TODO other labels such as Lead etc.
  // const isLead = (spaceId: string) => spaceRolesBySpaceId[spaceId]?.roles.includes(USER_ROLE_HUB_LEAD);
  //
  const getSpaceCardProps: DashboardSpaceSectionProps['getSpaceCardProps'] = () => {
    return {
      // lead: isLead(space.id),
      member: false,
    };
  };

  if (isLoading) {
    return <Loading />;
  }

  if (spaces.length === 0) {
    return null;
  }

  return (
    <DashboardSpacesSection
      headerText={t('pages.home.sections.my-spaces.header', { mySpacesCount: spaces.length })}
      spaces={spaces}
      getSpaceCardProps={getSpaceCardProps}
    />
  );
};

export default MySpacesSection;
