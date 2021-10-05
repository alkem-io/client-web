import React, { FC } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { PageProps } from '../..';
import { ListPage } from '../../../components/Admin/ListPage';
import { useUrlParams } from '../../../hooks';
import { useOrganizationGroupsQuery } from '../../../hooks/generated/graphql';

export const OrganizationGroupsPage: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { organizationNameId } = useUrlParams();
  const { data } = useOrganizationGroupsQuery({ variables: { id: organizationNameId } });

  const groups = data?.organization?.groups?.map(g => ({ id: g.id, value: g.name, url: `${url}/${g.id}` }));

  return <ListPage paths={paths} data={groups || []} newLink={`${url}/new`} />;
};
