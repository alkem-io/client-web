import { useQuery } from '@apollo/client';
import clsx from 'clsx';
import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import roles from '../../configs/roles.json';
import { useUserProfileQuery } from '../../generated/graphql';
/*components imports end*/
import { QUERY_USER_PROFILE } from '../../graphql/user';
import { createStyles } from '../../hooks/useTheme';
import { defaultUser } from '../../models/User';
/*lib imports end*/
import UserFrom, { EditMode } from '../Admin/UserForm';
import { Loading } from '../core/Loading';
import Typography from '../core/Typography';

/*local files imports end*/

const useUserRoleStyles = createStyles(theme => ({
  roleContainer: {
    display: 'flex',
    gap: `${theme.shape.spacing(1)}px`,
  },
  role: {
    padding: '5px 10px',
    backgroundColor: theme.palette.primary,
    borderRadius: theme.shape.spacing(2),
  },
}));

export const UserRoles: FC = () => {
  const styles = useUserRoleStyles();
  const { data } = useUserProfileQuery();

  const groups = data?.me?.memberof?.groups.map(g => g.name) || [];

  const getMyRoles = () => {
    const specialRoles = roles['groups-roles'].filter(r => groups.includes(r.group));
    return specialRoles.length > 0 ? specialRoles.map(r => r.role) : [roles['default-role']];
  };

  return (
    <div className={styles.roleContainer}>
      {getMyRoles().map(r => (
        <Typography color={'background'} variant={'caption'} className={clsx(styles.role)}>
          {r}
        </Typography>
      ))}
    </div>
  );
};

export const UserProfile: FC = () => {
  const { data, loading } = useQuery(QUERY_USER_PROFILE);

  if (loading) return <Loading />;

  return (
    <Container className={'mt-5'}>
      <UserFrom user={data?.me || defaultUser} editMode={EditMode.readOnly} title={'My profile'} />
    </Container>
  );
};

export default UserProfile;
