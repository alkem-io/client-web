import React, { FC, useMemo } from 'react';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { PageProps } from '../../../pages';
import { ListPage } from '../ListPage';
import { Application } from '../../../types/graphql-schema';

interface ApplicationPageProps extends PageProps {
  applications: Application[];
  url: string;
}

export const ApplicationPage: FC<ApplicationPageProps> = ({ paths, url, applications }) => {
  const currentPaths = useMemo(() => [...paths, { name: 'applications', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <ListPage
      paths={paths}
      data={applications.map(x => ({ id: x.id, value: x.user.displayName, url: `${url}/${x.id}` }))}
    />
  );
};
export default ApplicationPage;
