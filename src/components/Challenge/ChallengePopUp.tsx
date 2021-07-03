import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import { useChallengeCardQuery } from '../../generated/graphql';
import { createStyles } from '../../hooks/useTheme';
import Avatar from '../core/Avatar';
import Button from '../core/Button';
import Divider from '../core/Divider';
import Loading from '../core/Loading';
import Typography from '../core/Typography';

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

interface ChallengePopUpProps {
  id: string;
  ecoverseId: string;
  onHide: () => void;
}

const ChallengePopUp: FC<ChallengePopUpProps> = ({ onHide, id, ecoverseId }) => {
  const styles = groupPopUpStyles();

  const { data, loading } = useChallengeCardQuery({ variables: { ecoverseId: ecoverseId, challengeId: id } });
  const challenge = data?.ecoverse?.challenge;
  const ecoverseName = data?.ecoverse?.nameID;
  const name = challenge?.displayName;
  const tags: string[] = challenge?.tagset?.tags || [];
  const avatar = challenge?.context?.visual?.avatar;
  const tagline = challenge?.context?.tagline;

  return (
    <>
      <Modal show={true} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Challenge Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <Loading text={'Loading the challenge'} />
          ) : (
            <>
              <div className={'d-flex align-items-center mb-3'}>
                <Avatar src={avatar} size={'lg'} />
                <div className={'ml-3'}>
                  <Typography variant={'h3'} className={styles.title}>
                    {name}
                  </Typography>
                </div>
                <div className={'flex-grow-1'} />
              </div>

              <Typography weight={'medium'} color={'neutralMedium'} variant={'h4'}>
                {tagline}
              </Typography>
              <Divider noPadding />

              <Typography weight={'medium'} color={'neutralMedium'} variant={'h4'}>
                Ecoverse: {ecoverseName}
              </Typography>
              <Divider noPadding />

              <Typography weight={'medium'} color={'neutralMedium'} variant={'h4'}>
                Todo: ue the banner, label for the ecoverse displayName, more info button for the Challenge, link to the
                ecoverse?
              </Typography>
              <Divider noPadding />

              <Typography weight={'medium'} color={'neutralMedium'} variant={'h4'}>
                Tags: {tags}
              </Typography>
              <Divider noPadding />
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

export default ChallengePopUp;
