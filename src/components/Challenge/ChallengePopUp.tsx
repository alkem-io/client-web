import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Dialog from '@material-ui/core/Dialog';
import { useChallengeCardQuery } from '../../hooks/generated/graphql';
import { createStyles } from '../../hooks/useTheme';
import Avatar from '../core/Avatar';
import Button from '../core/Button';
import Divider from '../core/Divider';
import { Loading } from '../core';
import Typography from '../core/Typography';
import hexToRGBA from '../../utils/hexToRGBA';
import { DialogActions, DialogContent } from '../core/dialog';

// todo restructure css
const groupPopUpStyles = createStyles(theme => ({
  title: {
    textTransform: 'capitalize',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  table: {
    '& > thead > tr > th': {
      background: theme.palette.primary.main,
      color: theme.palette.background.paper,
      textAlign: 'center',
    },
    '& td': {
      padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    },
  },
  italic: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  divCentered: {
    display: 'flex',
    justifyContent: 'center',
    flexGrow: 1,
  },
  wrapperBackdrop: {
    background: hexToRGBA(theme.palette.neutral.main, 0.6),
  },
  wrapperInner: {
    padding: '1rem',
  },
  top: {},
  body: {},
}));

interface ChallengePopUpProps {
  id: string;
  ecoverseId: string;
  onHide: () => void;
}

const ChallengePopUp: FC<ChallengePopUpProps> = ({ onHide, id, ecoverseId }) => {
  const { t } = useTranslation();
  const styles = groupPopUpStyles();

  const { data, loading } = useChallengeCardQuery({ variables: { ecoverseId: ecoverseId, challengeId: id } });
  const challenge = data?.ecoverse?.challenge;
  const ecoverseNameID = data?.ecoverse?.nameID;
  const ecoverseDisplayName = data?.ecoverse?.displayName;
  const name = challenge?.displayName;
  const nameID = challenge?.nameID;
  const tags: string[] = challenge?.tagset?.tags || [];
  const avatar = challenge?.context?.visual?.avatar;
  const banner = challenge?.context?.visual?.banner || '';
  const tagline = challenge?.context?.tagline;

  return (
    <>
      <Dialog open={true} maxWidth="md" fullWidth aria-labelledby="challenge-dialog-title">
        <DialogContent
          dividers
          style={{
            background: banner ? `url("${banner}") no-repeat center center / cover` : 'none',
            padding: 0,
          }}
        >
          {loading ? (
            <Loading text={'Loading the challenge'} />
          ) : (
            <div className={styles.wrapperBackdrop}>
              <div className={styles.wrapperInner}>
                <div className={styles.top}>
                  <div className={'d-flex align-items-center mb-3'}>
                    <Avatar src={avatar} size={'lg'} />
                    <div className={styles.divCentered}>
                      <Typography variant={'h3'} color={'neutralLight'} className={styles.title}>
                        {name}
                      </Typography>
                    </div>
                  </div>
                  <Typography weight={'medium'} color={'neutralLight'} variant={'h4'}>
                    {tagline}
                  </Typography>
                </div>

                <div className={styles.body}>
                  <Divider noPadding />
                  <Typography weight={'medium'} color={'neutralLight'} variant={'h4'}>
                    Ecoverse: {ecoverseDisplayName}
                  </Typography>

                  {/*<Typography weight={'medium'} color={'neutralMedium'} variant={'h4'}>
                    Todo: ue the banner, label for the ecoverse displayName, more info button for the Challenge, link to
                    the ecoverse?
                  </Typography> */}
                  <Divider noPadding />
                  <div className={styles.divCentered}>
                    <Typography weight={'medium'} color={'neutralLight'} variant={'h4'}>
                      {tags.length > 0 ? tags.join(', ') : 'No tags available'}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="primary"
            text={t('buttons.explore')}
            as={Link}
            to={`/${ecoverseNameID}/challenges/${nameID}`}
          />
          <Button onClick={onHide} text={t('buttons.close')} />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChallengePopUp;
