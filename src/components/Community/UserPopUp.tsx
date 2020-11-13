import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import Avatar from '../core/Avatar';
import Typography from '../core/Typography';
import { UserCardProps } from './UserCard';
import Tags from './Tags';

const UserPopUp: FC<UserCardProps> = ({
  id,
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
  const getArrayOfNames = arr => arr.map(el => el?.name);
  const getStringOfNames = arr => arr.join(', ');

  const groups = getArrayOfNames(memberof?.groups);
  const challenges = getArrayOfNames(memberof?.challenges);
  const organisations = getArrayOfNames(memberof?.organisations);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">User Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={'d-flex align-items-center mb-3'}>
          <Avatar src={profile?.avatar} size={'lg'} />
          <div className={'ml-3'}>
            <h4>{name}</h4>
            <Tags tags={terms} />
          </div>
        </div>
        <Typography weight={'medium'} color={'neutral'} as={'p'}>
          {firstName} {lastName} {gender && `(${gender})`}
        </Typography>
        {profile?.description && (
          <Typography weight={'medium'} color={'neutral'} as={'p'}>
            Description: {profile.description}
          </Typography>
        )}
        <Typography weight={'medium'} as={'p'}>
          {email}
        </Typography>
        <Typography weight={'medium'} as={'p'}>
          {country} {city}
        </Typography>
        {profile?.references && profile?.references.length > 0 && (
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
        {groups && groups.length > 0 && (
          <Typography weight={'medium'} as={'p'}>
            Member of groups: {getStringOfNames(groups)}
          </Typography>
        )}
        {challenges && challenges.length > 0 && (
          <Typography weight={'medium'} as={'p'}>
            Member of challenges: {getStringOfNames(challenges)}
          </Typography>
        )}
        {organisations && organisations.length > 0 && (
          <Typography weight={'medium'} as={'p'}>
            Member of organisations: {getStringOfNames(organisations)}
          </Typography>
        )}
      </Modal.Body>
    </>
  );
};

export default UserPopUp;
