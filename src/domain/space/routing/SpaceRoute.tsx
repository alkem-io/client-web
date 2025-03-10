import { Navigate, Route, Routes } from 'react-router-dom';
import React from 'react';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import useAboutRedirect from '@/core/routing/useAboutRedirect';
import { useSpaceTemplatesManagerQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useSpace } from '../SpaceContext/useSpace';

const routes = { ...EntityPageSection };

const SpaceRoute = () => {
  const spaceContext = useSpace();
  const spaceId = spaceContext.space.id;

  // TODO: add in a route to the About page if the user does not have READ access; storing the requested URL
  // Add in a route above this?
  const hasReadAccess = true;
  useAboutRedirect({ spaceId, skip: !spaceId });

  const { data: templatesManagerData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId },
    skip: !spaceId,
  });
  const canCreateTemplates =
    templatesManagerData?.lookup.space?.templatesManager?.templatesSet?.authorization?.myPrivileges?.includes(
      AuthorizationPrivilege.Create
    ) ?? false;
  console.log(` spaceId: ${spaceId}, canCreateTemplates: ${canCreateTemplates}, readAccess: ${hasReadAccess}`);

  return (
    <Routes>
      <Route index element={<Navigate replace to={routes.Dashboard} />} />
    </Routes>
  );
};

export default SpaceRoute;
