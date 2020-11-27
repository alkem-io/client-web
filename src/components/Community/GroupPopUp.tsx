import React, { FC } from 'react';
import { Modal, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Avatar from '../core/Avatar';
import Typography from '../core/Typography';
import { User } from '../../generated/graphql';
import { Tagset } from '../../models/User';
import Tags from './Tags';
import { createStyles } from '../../hooks/useTheme';
import { ReactComponent as People } from 'bootstrap-icons/icons/people.svg';
import Divider from '../core/Divider';

const groupPopUpStyles = createStyles(theme => ({
  title: {
    textTransform: 'capitalize',
  },
}));

interface GroupPopUpProps {
  name: string;
  members?: Array<User>;
  profile?: {
    description?: string;
    avatar?: string;
    tagsets?: Tagset[];
    references?: Array<{ name: string; uri: string }>;
  };
  terms: Array<string>;
}

const GroupPopUp: FC<GroupPopUpProps> = ({ name, members, profile, terms }) => {
  const styles = groupPopUpStyles();
  const tags = profile?.tagsets?.find(ts => ts.name === 'default')?.tags?.map(t => t) || [];
  const tagList = [...terms, ...tags];

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Group Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={'d-flex align-items-center mb-3'}>
          <Avatar src={profile?.avatar} size={'lg'} />
          <div className={'ml-3'}>
            <Typography variant={'h3'} className={styles.title}>
              {name}
            </Typography>
            <Tags tags={tagList} />
          </div>
          <div className={'flex-grow-1'} />
          <OverlayTrigger placement={'bottom'} overlay={<Tooltip id={'membersTooltip'}>Members</Tooltip>}>
            <Typography weight={'medium'} color={'neutral'} variant={'h5'}>
              <People width={30} height={30} /> {members?.length}
            </Typography>
          </OverlayTrigger>
        </div>

        <Typography weight={'medium'} color={'neutralMedium'} variant={'h4'}>
          {profile?.description}
        </Typography>

        <Divider noPadding />

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
      </Modal.Body>
    </>
  );
};

export default GroupPopUp;
