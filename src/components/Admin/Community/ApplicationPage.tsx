import React, { FC, useMemo } from 'react';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { PageProps } from '../../../pages';

interface ApplicationPageProps extends PageProps {}

export const ApplicationPage: FC<ApplicationPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { name: 'applications', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  return <div>Comming soon!</div>;
};
export default ApplicationPage;
