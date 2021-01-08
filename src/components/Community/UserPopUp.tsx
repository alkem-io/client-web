import React, { FC } from 'react';
import { Modal, Table } from 'react-bootstrap';
import { ReactComponent as InfoCircle } from 'bootstrap-icons/icons/info-circle.svg';
import { ReactComponent as At } from 'bootstrap-icons/icons/at.svg';
import { ReactComponent as People } from 'bootstrap-icons/icons/people.svg';
import Avatar from '../core/Avatar';
import Typography from '../core/Typography';
import Tags from './Tags';
import Divider from '../core/Divider';
import { createStyles } from '../../hooks/useTheme';
import Button from '../core/Button';
import { useUserQuery } from '../../generated/graphql';

const useUserPopUpStyles = createStyles(theme => ({
  centeredText: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: theme.shape.spacing(1),
  },
  table: {
    '& > thead > tr > th': {
      background: theme.palette.primary,
      color: theme.palette.background,
      textAlign: 'center',
    },
    '& td': {
      padding: `${theme.shape.spacing(1)}px ${theme.shape.spacing(2)}px`,
    },
  },
}));

interface UserPopUpProps {
  id: string;
  onHide: () => void;
  terms?: Array<string>;
}

const UserPopUp: FC<UserPopUpProps> = ({ id, onHide, terms = [] }) => {
  const styles = useUserPopUpStyles();

  const { data } = useUserQuery({ variables: { id } });

  const getArrayOfNames = arr => arr?.map(el => el?.name);
  const getStringOfNames = arr => arr.join(', ');

  const user = data?.user;

  const groups = getArrayOfNames(user?.memberof?.groups);
  const challenges = getArrayOfNames(user?.memberof?.challenges);
  const organisations = getArrayOfNames(user?.memberof?.organisations);

  const refs = user?.profile?.references?.filter(r => r.uri.trim() !== '');

  return (
    <Modal show={true} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">User Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={'d-flex align-items-center mb-3'}>
          <Avatar src={user?.profile?.avatar} size={'lg'} />
          <div className={'ml-3'}>
            <Typography variant={'h3'}>{user?.name}</Typography>
            <Tags tags={terms} />
          </div>
        </div>

        <Typography weight={'medium'} color={'neutral'} variant={'h4'} className={styles.centeredText}>
          <InfoCircle width={25} height={25} className={styles.icon} /> General
        </Typography>
        <Typography weight={'medium'} color={'neutral'} as={'span'}>
          {user?.firstName}{' '}
        </Typography>
        <Typography weight={'medium'} color={'neutral'} as={'span'}>
          {user?.lastName}{' '}
        </Typography>
        <Typography weight={'medium'} color={'neutral'} as={'span'}>
          {user?.gender && `(${user?.gender})`}
        </Typography>
        {user?.profile?.description && (
          <Typography weight={'medium'} color={'neutral'} as={'p'}>
            {user?.profile.description}
          </Typography>
        )}

        <Divider noPadding />
        <Typography weight={'medium'} color={'neutral'} variant={'h4'} className={styles.centeredText}>
          <People width={30} height={30} className={styles.icon} /> Member of
        </Typography>
        <Table striped bordered hover size="sm" className={styles.table}>
          <thead>
            <tr>
              <th>Community</th>
              <th>List</th>
            </tr>
          </thead>
          <tbody>
            {groups && groups.length > 0 && (
              <tr>
                <td>
                  <Typography weight={'medium'} className={styles.centeredText}>
                    Groups
                  </Typography>
                </td>
                <td>
                  <Typography weight={'medium'}>{getStringOfNames(groups)}</Typography>
                </td>
              </tr>
            )}
            {challenges && challenges.length > 0 && (
              <tr>
                <td>
                  <Typography weight={'medium'} className={styles.centeredText}>
                    Challenges
                  </Typography>
                </td>
                <td>{getStringOfNames(challenges)}</td>
              </tr>
            )}
            {organisations && organisations.length > 0 && (
              <tr>
                <td>
                  <Typography weight={'medium'} className={styles.centeredText}>
                    Organisations
                  </Typography>
                </td>
                <td>{getStringOfNames(organisations)}</td>
              </tr>
            )}
          </tbody>
        </Table>

        <Divider noPadding />

        <Typography weight={'medium'} color={'neutral'} variant={'h4'} className={styles.centeredText}>
          <At width={30} height={30} className={styles.icon} />
          Contact information
        </Typography>

        <Typography weight={'medium'} as={'p'}>
          {user?.email}
        </Typography>
        <Typography weight={'medium'} as={'p'}>
          {user?.country} {user?.city}
        </Typography>
        {refs && refs.length > 0 && (
          <>
            <Typography>References: </Typography>
            {user?.profile?.references?.map((r, index) => (
              <Typography key={index}>
                <a href={r.uri} rel="noopener noreferrer" target="_blank">
                  {r.name}
                </a>
              </Typography>
            ))}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserPopUp;
