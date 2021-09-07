import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useRouteMatch } from 'react-router';
import { useOrganisation } from '../../hooks/useOrganisation';
import { useUpdateNavigation } from '../../hooks';

const OrganisationPage: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { organisation } = useOrganisation();
  const currentPaths = useMemo(
    () => (organisation ? [...paths, { value: url, name: organisation.displayName, real: true }] : paths),
    [paths, organisation]
  );

  useUpdateNavigation({ currentPaths });

  return (
    <>
      {organisation?.displayName}
      <br />
      {organisation?.nameID}
      <br />
      {organisation?.contactEmail}
      <br />
    </>
  );
};

export default OrganisationPage;
