import React, { FC } from 'react';
import { Modal, Table } from 'react-bootstrap';
import { ReactComponent as InfoCircle } from 'bootstrap-icons/icons/info-circle.svg';
import { ReactComponent as At } from 'bootstrap-icons/icons/at.svg';
import { ReactComponent as People } from 'bootstrap-icons/icons/people.svg';
import Avatar from '../core/Avatar';
import Typography from '../core/Typography';
import { UserCardProps } from './UserCard';
import Tags from './Tags';
import Divider from '../core/Divider';
import { createStyles } from '../../hooks/useTheme';

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

const UserPopUp: FC<UserCardProps> = ({
  name,
  email,
  gender,
  country,
  city,
  firstName,
  lastName,
  profile,
  memberof,
  terms = [],
}) => {
  const styles = useUserPopUpStyles();

  const getArrayOfNames = arr => arr?.map(el => el?.name);
  const getStringOfNames = arr => arr.join(', ');

  const groups = getArrayOfNames(memberof?.groups);
  const challenges = getArrayOfNames(memberof?.challenges);
  const organisations = getArrayOfNames(memberof?.organisations);

  const refs = profile?.references?.filter(r => r.uri.trim() !== '');

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">User Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={'d-flex align-items-center mb-3'}>
          <Avatar src={profile?.avatar} size={'lg'} />
          <div className={'ml-3'}>
            <Typography variant={'h3'}>{name}</Typography>
            <Tags tags={terms} />
          </div>
        </div>

        <Typography weight={'medium'} color={'neutral'} variant={'h4'} className={styles.centeredText}>
          <InfoCircle width={25} height={25} className={styles.icon} /> General
        </Typography>
        <Typography weight={'medium'} color={'neutral'} as={'span'}>
          {firstName}{' '}
        </Typography>
        <Typography weight={'medium'} color={'neutral'} as={'span'}>
          {lastName}{' '}
        </Typography>
        <Typography weight={'medium'} color={'neutral'} as={'span'}>
          {gender && `(${gender})`}
        </Typography>
        {profile?.description && (
          <Typography weight={'medium'} color={'neutral'} as={'p'}>
            {profile.description}
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
          {email}
        </Typography>
        <Typography weight={'medium'} as={'p'}>
          {country} {city}
        </Typography>
        {refs && refs.length > 0 && (
          <>
            <Typography>References: </Typography>
            {profile?.references?.map((r, index) => (
              <Typography key={index}>
                <a href={r.uri} rel="noopener noreferrer" target="_blank">
                  {r.name}
                </a>
              </Typography>
            ))}
          </>
        )}
      </Modal.Body>
    </>
  );
};

export default UserPopUp;
