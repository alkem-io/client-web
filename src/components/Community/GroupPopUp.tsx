import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import Avatar from '../core/Avatar';
import Typography from '../core/Typography';
import { User } from '../../generated/graphql';

interface GroupPopUpProps {
  name: string;
  members?: Array<User>;
  profile?: {
    description?: string;
    avatar?: string;
  };
}

const GroupPopUp: FC<GroupPopUpProps> = ({ name, members, profile }) => (
  <>
    <Modal.Header closeButton>
      <Modal.Title id="contained-modal-title-vcenter">User Details</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className={'d-flex align-items-center mb-3'}>
        <Avatar src={profile?.avatar} size={'big'} />
        <h4 className={'ml-3'}>{name}</h4>
      </div>
      <Typography weight={'medium'} color={'neutral'} as={'p'}>
        {profile?.description}
      </Typography>
      <Typography weight={'medium'} color={'neutral'} as={'p'}>
        Members: {members?.length}
      </Typography>
    </Modal.Body>
  </>
);

export default GroupPopUp;
