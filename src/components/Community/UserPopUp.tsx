import { ReactComponent as At } from 'bootstrap-icons/icons/at.svg';
import { ReactComponent as InfoCircle } from 'bootstrap-icons/icons/info-circle.svg';
import { ReactComponent as People } from 'bootstrap-icons/icons/people.svg';
import React, { FC } from 'react';
import { Modal, Table } from 'react-bootstrap';
import { createStyles } from '../../hooks/useTheme';
import { useUserMetadata } from '../../hooks/useUserMetadata';
import Avatar from '../core/Avatar';
import Button from '../core/Button';
import Divider from '../core/Divider';
import Loading from '../core/Loading';
import Typography from '../core/Typography';
import Tags from './Tags';

const useUserPopUpStyles = createStyles(theme => ({
  body: {
    maxHeight: 600,
    overflow: 'auto',
  },
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

  const { user: userMetadata, loading } = useUserMetadata(id);
  const user = userMetadata?.user;

  const getStringOfNames = arr => arr.join(', ');

  const groups = userMetadata?.groups || [];
  const challenges = userMetadata?.challenges || [];
  const organizations = userMetadata?.organizations || [];
  const opportunities = userMetadata?.opportunities || [];

  const refs = user?.profile?.references?.filter(r => r.uri.trim() !== '');

  return (
    <Modal show={true} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <div className={'d-flex align-items-center mb-3'}>
            <Avatar src={user?.profile?.avatar} size={'lg'} />
            <div className={'ml-3'}>
              <Typography variant={'h3'}>{user?.displayName}</Typography>
              <Tags tags={terms} />
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.body}>
        {loading ? (
          <Loading text={'Loading user'} />
        ) : (
          <>
            <Typography weight={'medium'} color={'neutral'} variant={'h4'} className={styles.centeredText}>
              <InfoCircle width={25} height={25} className={styles.icon} /> General
            </Typography>
            {user?.firstName && (
              <Typography weight={'medium'} color={'neutral'} as={'span'}>
                {user?.firstName}{' '}
              </Typography>
            )}
            {user?.lastName && (
              <Typography weight={'medium'} color={'neutral'} as={'span'}>
                {user?.lastName}{' '}
              </Typography>
            )}
            {user?.gender && (
              <Typography weight={'medium'} color={'neutral'} as={'span'}>
                {`(${user?.gender})`}
              </Typography>
            )}
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
                {organizations && organizations.length > 0 && (
                  <tr>
                    <td>
                      <Typography weight={'medium'} className={styles.centeredText}>
                        Organisations
                      </Typography>
                    </td>
                    <td>{getStringOfNames(organizations)}</td>
                  </tr>
                )}
                {opportunities && opportunities.length > 0 && (
                  <tr>
                    <td>
                      <Typography weight={'medium'} className={styles.centeredText}>
                        Opportunites
                      </Typography>
                    </td>
                    <td>{getStringOfNames(opportunities)}</td>
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
            {(user?.country || user?.city) && (
              <Typography weight={'medium'} as={'p'}>
                {user?.country} {user?.city}
              </Typography>
            )}
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
