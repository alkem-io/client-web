import React, { FC } from 'react';
import { Modal, Table } from 'react-bootstrap';
import { ReactComponent as InfoCircle } from 'bootstrap-icons/icons/info-circle.svg';
import { ReactComponent as BookMarks } from 'bootstrap-icons/icons/bookmarks.svg';
import { ReactComponent as People } from 'bootstrap-icons/icons/people.svg';

import Avatar from '../core/Avatar';
import Typography from '../core/Typography';
import Divider from '../core/Divider';
import AvatarContainer from '../core/AvatarContainer';
import Button from '../core/Button';
import Loading from '../core/Loading';
import shuffleCollection from '../../utils/shuffleCollection';
import Tags from '../Community/Tags';
import { createStyles } from '../../hooks/useTheme';
import { useOrganizationDetailsQuery, User } from '../../generated/graphql';
import { AvatarsProvider } from '../../context/AvatarsProvider';

const groupPopUpStyles = createStyles(theme => ({
  title: {
    textTransform: 'capitalize',
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
  italic: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
}));

interface TableProps {
  headerTitles: string[];
  icon: React.ComponentType<any>;
  iconText: string;
}

const ProfileTable: FC<TableProps> = ({ headerTitles, children, icon: Icon, iconText }) => {
  const styles = groupPopUpStyles();

  return (
    <>
      <Typography weight={'medium'} color={'neutral'} variant={'h4'} className={styles.centeredText}>
        <Icon width={25} height={25} className={styles.icon} /> {iconText}
      </Typography>
      <Table striped bordered hover size="sm" className={styles.table}>
        <thead>
          <tr>
            {headerTitles.map((ht, index) => (
              <th key={index}>{ht}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </Table>
    </>
  );
};

interface OrganizationPopUpProps {
  id?: string | null;
  onHide: () => void;
}

const OrganizationPopUp: FC<OrganizationPopUpProps> = ({ onHide, id }) => {
  const styles = groupPopUpStyles();

  const { data, loading } = useOrganizationDetailsQuery({ variables: { id: Number(id) } });
  const profile = data?.organisation?.profile;
  const name = data?.organisation?.name;
  const groups = data?.organisation?.groups;
  const tags = profile?.tagsets?.reduce((acc, curr) => acc.concat(curr.tags), [] as string[]) || [];

  return (
    <>
      <Modal show={true} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Organization Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <Loading text={'Loading the organization'} />
          ) : (
            <>
              <div className={'d-flex align-items-center mb-3'}>
                <Avatar src={profile?.avatar} size={'lg'} />
                <div className={'ml-3'}>
                  <Typography variant={'h3'} className={styles.title}>
                    {name}
                  </Typography>
                </div>
                <div className={'flex-grow-1'} />
              </div>

              <Typography weight={'medium'} color={'neutralMedium'} variant={'h4'}>
                {profile?.description}
              </Typography>
              <Divider noPadding />

              <ProfileTable headerTitles={['Tagset', 'Tags']} icon={BookMarks} iconText={'Tags'}>
                {tags.length > 0 && (
                  <>
                    {profile?.tagsets?.map((ts, index) => (
                      <tr key={index}>
                        <td>
                          <Typography weight={'medium'} className={styles.centeredText}>
                            {ts.name}
                          </Typography>
                        </td>
                        <td>
                          {ts.tags.length > 0 ? (
                            <Tags tags={ts.tags} />
                          ) : (
                            <Typography weight={'medium'} className={styles.italic}>
                              no tags yet
                            </Typography>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </ProfileTable>

              {profile?.references && profile?.references.length > 0 && (
                <ProfileTable headerTitles={['Name', 'URI']} icon={InfoCircle} iconText={'References'}>
                  {profile?.references?.map((ref, index) => (
                    <tr key={index}>
                      <td>
                        <Typography weight={'medium'} className={styles.centeredText}>
                          {ref.name}
                        </Typography>
                      </td>
                      <td>
                        <Typography weight={'medium'} className={styles.centeredText}>
                          {ref.uri}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </ProfileTable>
              )}

              <Divider noPadding />

              <Typography weight={'medium'} color={'neutral'} variant={'h4'} className={styles.centeredText}>
                <People width={25} height={25} className={styles.icon} /> Groups
              </Typography>

              {groups?.map((g, index) => (
                <AvatarsProvider users={g.members as User[]} count={10} key={index}>
                  {populated => (
                    <AvatarContainer className="d-flex" title={g.name}>
                      {shuffleCollection(populated).map((u, i) => (
                        <Avatar className={'d-inline-flex'} key={i} src={u.profile?.avatar} name={u.name} />
                      ))}
                      {g.members && g.members?.length === 0 && (
                        <Typography className={styles.italic}>No members yet</Typography>
                      )}
                      {g.members && g.members?.length - populated.length > 0 && (
                        <Typography variant="h3" as="h3" color="positive">
                          {`... + ${g.members.length - populated.length} other members`}
                        </Typography>
                      )}
                    </AvatarContainer>
                  )}
                </AvatarsProvider>
              ))}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrganizationPopUp;
