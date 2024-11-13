import React, { FC } from 'react';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';
import { useAdminVirtualContributorsQuery } from '@core/apollo/generated/apollo-hooks';
import Avatar from '@core/ui/avatar/Avatar';
import { BlockTitle, CardTitle } from '@core/ui/typography';
import { useTranslation } from 'react-i18next';
import BadgeCardView from '@core/ui/list/BadgeCardView';
import RouterLink from '@core/ui/link/RouterLink';
import Loading from '@core/ui/loading/Loading';
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const VirtualContributorsPage: FC = () => {
  const { t } = useTranslation();
  const { data, loading: loadingVCs } = useAdminVirtualContributorsQuery();

  return (
    <AdminLayout currentTab={AdminSection.VirtualContributors}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={10}>
          {loadingVCs && <Loading />}
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow
                  sx={{
                    width: '100%',
                    background: theme => theme.palette.primary.main,
                    verticalAlign: 'middle',
                  }}
                >
                  <TableCell component="th" scope="row">
                    <CardTitle color="primary.contrastText">Name</CardTitle>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.virtualContributors.map((virtualContributor, i) => (
                  <TableRow
                    key={virtualContributor.id}
                    sx={{
                      backgroundColor: i % 2 === 0 ? 'inherit' : 'action.hover',
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell component="td" scope="row" sx={{ width: '100%', paddingY: 1, verticalAlign: 'middle' }}>
                      <BadgeCardView
                        key={virtualContributor.id}
                        sx={{ flex: 1 }}
                        visual={
                          <Avatar
                            src={virtualContributor.profile.avatar?.uri}
                            alt={t('common.avatar-of', { user: virtualContributor.profile.displayName })}
                          />
                        }
                        component={RouterLink}
                        to={virtualContributor.profile.url}
                      >
                        <BlockTitle>{virtualContributor.profile.displayName}</BlockTitle>
                      </BadgeCardView>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default VirtualContributorsPage;
