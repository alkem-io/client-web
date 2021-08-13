import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { EcoverseDetailsFragment } from '../../../../models/graphql-schema';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '../../../core/Avatar';
import clsx from 'clsx';
import Button from '../../../core/Button';
import Tooltip from '@material-ui/core/Tooltip';

interface SidebarItemEcoverseProps {
  ecoverse: EcoverseDetailsFragment;
  hideLabel?: boolean;
  centerLabel?: boolean;
}

const useStyles = makeStyles(() => ({
  textDecorationNone: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  textAlignLeft: {
    textAlign: 'left',
  },
  wrapper: {
    display: 'flex',
  },
  widthFull: {
    width: '100%',
  },
  link: {
    alignItems: 'center',
    width: '100%',
    flexGrow: 1,
  },
  center: {
    justifyContent: 'center',
  },
  start: {
    justifyContent: 'flex-start',
  },
  noMarginAvatar: {
    margin: 0,
  },
}));

const SidebarItemEcoverse: FC<SidebarItemEcoverseProps> = ({ ecoverse, hideLabel, centerLabel }) => {
  const styles = useStyles();
  const tooltip = ecoverse.displayName;
  const ecoverseLogo = ecoverse?.context?.visual?.avatar;

  return (
    <div className={styles.widthFull}>
      <Link to={`/${ecoverse.nameID}`} className={clsx(styles.textDecorationNone, styles.widthFull)}>
        <Tooltip placement="right" id={`tooltip-${tooltip.toLowerCase()}`} title={ecoverse.displayName}>
          <span className={clsx(styles.wrapper, styles.widthFull)}>
            <Button
              inset
              variant="transparent"
              className={clsx(styles.link, centerLabel ? styles.center : styles.start, styles.textAlignLeft)}
              text={hideLabel ? '' : ecoverse.displayName}
              startIcon={<Avatar size="md" src={ecoverseLogo} className={styles.textDecorationNone} />}
              classOverrides={{
                startIcon: clsx(hideLabel && styles.noMarginAvatar),
              }}
            />
          </span>
        </Tooltip>
      </Link>
    </div>
  );
};
export default SidebarItemEcoverse;
