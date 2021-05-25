import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import Avatar from '../core/Avatar';
import Typography from '../core/Typography';
import { User } from '../../types/graphql-schema';
import { Tagset } from '../../models/Profile';
import Tags from './Tags';
import { createStyles } from '../../hooks/useTheme';
import Divider from '../core/Divider';
import shuffleCollection from '../../utils/shuffleCollection';
import AvatarContainer from '../core/AvatarContainer';
import { AvatarsProvider } from '../../context/AvatarsProvider';

const groupPopUpStyles = createStyles(() => ({
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
  onHide: () => void;
}

const GroupPopUp: FC<GroupPopUpProps> = ({ onHide, name, members, profile, terms }) => {
  const styles = groupPopUpStyles();
  const tags = profile?.tagsets?.find(ts => ts.name === 'default')?.tags?.map(t => t) || [];
  const tagList = [...terms, ...tags];

  return (
    <Modal show={true} onHide={onHide} size="lg" centered>
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
        </div>

        <Typography weight={'medium'} color={'neutralMedium'} variant={'h4'}>
          {profile?.description}
        </Typography>

        <Divider noPadding />

        <AvatarsProvider users={members} count={10}>
          {populated => (
            <AvatarContainer className="d-flex" title={'Active community members'}>
              {shuffleCollection(populated).map((u, i) => (
                <Avatar className={'d-inline-flex'} key={i} src={u.profile?.avatar} name={u.displayName} />
              ))}
              {members && members?.length - populated.length > 0 && (
                <Typography variant="h3" as="h3" color="positive">
                  {`... + ${members.length - populated.length} other members`}
                </Typography>
              )}
            </AvatarContainer>
          )}
        </AvatarsProvider>

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
    </Modal>
  );
};

export default GroupPopUp;
