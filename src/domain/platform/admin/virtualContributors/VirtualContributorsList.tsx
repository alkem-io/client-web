import React, { FC, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';
import { GET_VIRTUAL_CONTRIBUTORS } from './VirtualContributorsQuery';
import { SearchableListItem } from '../../../platform/admin/components/SearchableList';
import { Grid, List } from '@mui/material';
import ListItemLink from '../../../shared/components/SearchableList/ListItemLink';
import useRelativeUrls from '../utils/useRelativeUrls';

const VirtualContributorsList: FC = () => {
  const { data } = useQuery(GET_VIRTUAL_CONTRIBUTORS);
  const virtualContributorsList = useMemo<SearchableListItem[]>(
    () =>
      (data?.virtualContributors ?? []).map(({ id, nameID, profile }) => ({
        id,
        value: `${profile.displayName}`,
        url: `${nameID}/edit`,
      })),
    [data]
  );

  const navigatableVirtualContributors = useRelativeUrls(virtualContributorsList);

  return (
    <AdminLayout currentTab={AdminSection.VirtualContributors}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={10}>
          <List>
            {navigatableVirtualContributors.map(item => (
              <ListItemLink key={item.id} to={`${item.url}`} primary={item.value} />
            ))}
          </List>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default VirtualContributorsList;
