import React, { FC } from 'react';
import { Modal, Table } from 'react-bootstrap';
import { useOrganizationDetailsQuery } from '../../generated/graphql';
import { createStyles } from '../../hooks/useTheme';
import { OrganisationMembership } from '../../types/graphql-schema';
import Avatar from '../core/Avatar';
import Button from '../core/Button';
import Loading from '../core/Loading';
import Typography from '../core/Typography';
import TagContainer from '../core/TagContainer';
import Tag from '../core/Tag';

const groupPopUpStyles = createStyles(theme => ({
  header: {
    display: 'flex',
    gap: theme.shape.spacing(4),
    alignItems: 'center',

    [theme.media.down('sm')]: {
      flexWrap: 'wrap',
      gap: theme.shape.spacing(2),
    },
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.shape.spacing(1),

    [theme.media.down('sm')]: {
      gap: 0,
      flexGrow: 1,
    },
  },
  userName: {
    whiteSpace: 'nowrap',
    display: 'flex',

    [theme.media.down('sm')]: {
      flexGrow: 1,
      justifyContent: 'center',
    },
  },
  description: {
    display: 'flex',
    flexGrow: 1,
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
  tableScrollable: {
    height: '200px',
    overflowY: 'auto',
  },
  tablesDiv: {
    display: 'flex',
    gap: theme.shape.spacing(2),
    flexDirection: 'column',
  },
  italic: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
}));

interface OrganizationPopUpProps {
  id: string;
  onHide: () => void;
  membership?: OrganisationMembership;
}

const OrganizationPopUp: FC<OrganizationPopUpProps> = ({ onHide, id, membership }) => {
  const styles = groupPopUpStyles();

  const { data, loading } = useOrganizationDetailsQuery({ variables: { id } });
  const profile = data?.organisation?.profile;
  const name = data?.organisation?.displayName;
  /*const groups = data?.organisation?.groups; todo: group section?*/
  const tags = profile?.tagsets?.reduce((acc, curr) => acc.concat(curr.tags), [] as string[]) || [];

  const ecoversesHosting = membership?.ecoversesHosting || [];
  const challengesLeading = membership?.challengesLeading || [];

  return (
    <>
      <Modal show={true} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            <div className={styles.header}>
              <div className={styles.profile}>
                <Avatar src={profile?.avatar} size={'lg'} />
                <div className={styles.userName}>
                  <Typography variant={'h3'}>{name}</Typography>
                </div>
              </div>
              {profile?.description && (
                <div className={styles.description}>
                  <Typography weight={'medium'} color={'neutral'} as={'p'} clamp={3}>
                    {profile?.description}
                  </Typography>
                </div>
              )}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <Loading text={'Loading the organization'} />
          ) : (
            <div className={styles.tablesDiv}>
              <div className={styles.centeredText}>
                {tags.length > 0 ? (
                  <TagContainer>
                    {tags.map((t, i) => (
                      <Tag key={i} text={t} color="neutralMedium" />
                    ))}
                  </TagContainer>
                ) : (
                  <span>No tags available</span>
                )}
              </div>
              <div className={ecoversesHosting.length > 0 ? styles.tableScrollable : undefined}>
                <Table striped bordered hover size="sm" className={styles.table}>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Tagline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ecoversesHosting.length > 0 &&
                      ecoversesHosting.map(x => (
                        <tr>
                          <td>{'' /*avatar*/ ? <Avatar src={'' /*avatar*/} size={'md'} /> : ''}</td>
                          <td>{x.displayName}</td>
                          <td>{/*tagline*/}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
                {ecoversesHosting.length === 0 && <div className={styles.centeredText}>No ecoverses are hosted</div>}
              </div>
              <div className={ecoversesHosting.length > 0 ? styles.tableScrollable : undefined}>
                <Table striped bordered hover size="sm" className={styles.table}>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Tagline</th>
                      <th>Ecoverse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challengesLeading.length > 0 &&
                      challengesLeading.map(x => (
                        <tr>
                          <td>{'' /*avatar*/ ? <Avatar src={'' /*avatar*/} size={'md'} /> : ''}</td>
                          <td>{x.displayName}</td>
                          <td>{/*tagline*/}</td>
                          <td>{/*ecoverseName*/}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
                {challengesLeading.length === 0 && <div className={styles.centeredText}>No challenges are led</div>}
              </div>
            </div>
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
