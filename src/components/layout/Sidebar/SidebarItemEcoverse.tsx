import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { EcoverseDetailsFragment } from '../../../types/graphql-schema';
import { createStyles } from '../../../hooks/useTheme';
import Avatar from '../../core/Avatar';
import { Typography } from '@material-ui/core';

interface SidebarItemEcoverseProps {
  ecoverse: EcoverseDetailsFragment;
  hideLabel?: boolean;
}

const useStyles = createStyles(theme => ({
  textDecorationNone: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center',

    '& > *': {
      margin: `${theme.shape.spacing(0.5)}px ${theme.shape.spacing(1)}px`,
    },
  },
}));

const SidebarItemEcoverse: FC<SidebarItemEcoverseProps> = ({ ecoverse, hideLabel }) => {
  const styles = useStyles();
  const tooltip = ecoverse.displayName;
  const ecoverseLogo = ecoverse?.context?.visual?.avatar;

  return (
    <div>
      <Link to={`/${ecoverse.nameID}`} className={styles.textDecorationNone}>
        <OverlayTrigger
          offset={[100, 100]}
          placement="right"
          overlay={<Tooltip id={`tooltip-${tooltip.toLowerCase()}`}>{tooltip}</Tooltip>}
        >
          <span className={styles.wrapper}>
            <Avatar size="md" src={ecoverseLogo} className={styles.textDecorationNone} />
            {!hideLabel && (
              <Typography variant="button" color="primary" className={styles.textDecorationNone}>
                {ecoverse.displayName}
              </Typography>
            )}
          </span>
        </OverlayTrigger>
      </Link>
    </div>
  );
};
export default SidebarItemEcoverse;
