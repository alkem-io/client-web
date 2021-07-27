import React, { FC, useMemo } from 'react';
import Card from '../core/Card';
import {
  refetchUserApplicationsQuery,
  useDeleteUserApplicationMutation,
  useUserApplicationsQuery,
} from '../../hooks/generated/graphql';
import { APPLICATION_STATE_NEW, APPLICATION_STATE_REJECTED } from '../../models/constants';
import Typography from '../core/Typography';
import Tag from '../core/Tag';
import { createStyles } from '../../hooks/useTheme';
import Icon from '../core/Icon';
import { ReactComponent as Trash } from 'bootstrap-icons/icons/trash.svg';
import IconButton from '../core/IconButton';
import { useApolloErrorHandler } from '../../hooks';
import { useNotification } from '../../hooks';
import { User } from '../../models/graphql-schema';

const useStyles = createStyles(theme => ({
  listDetail: {
    padding: theme.shape.spacing(1),
    marginTop: theme.shape.spacing(1),
    backgroundColor: theme.palette.neutralLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noPadding: {
    padding: 0,
  },
}));

interface Props {
  user?: User;
}

const PendingApplications: FC<Props> = ({ user }) => {
  const userId = user?.id || '';

  const styles = useStyles();
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const { data: memberShip } = useUserApplicationsQuery({ variables: { input: { userID: userId } } });
  const applications = memberShip?.membershipUser?.applications || [];
  const pendingApp = useMemo(
    () => applications.filter(x => x.state === APPLICATION_STATE_NEW || x.state === APPLICATION_STATE_REJECTED),
    [applications]
  );

  const [deleteApplication] = useDeleteUserApplicationMutation({
    onCompleted: () => notify('Successfully deleted', 'success'),
    onError: handleError,
    refetchQueries: [refetchUserApplicationsQuery({ input: { userID: userId } })],
    awaitRefetchQueries: true,
  });

  const handleDelete = (id: string) => {
    deleteApplication({
      variables: {
        input: {
          ID: id,
        },
      },
    });
  };

  return (
    <Card primaryTextProps={{ text: 'Pending applications' }} className={'mt-2'}>
      {pendingApp.map((x, i) => (
        <div key={i} className={styles.listDetail}>
          <Typography as="span" className={styles.noPadding}>
            {x.displayName}
          </Typography>
          <div className="d-flex align-items-center">
            <Tag text={x.state} color="neutralMedium" />
            <IconButton onClick={() => handleDelete(x.id)}>
              <Icon component={Trash} color="negative" size={'md'} />
            </IconButton>
          </div>
        </div>
      ))}
    </Card>
  );
};
export default PendingApplications;
