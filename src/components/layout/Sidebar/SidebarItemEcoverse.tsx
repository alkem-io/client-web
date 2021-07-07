import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { EcoverseDetailsFragment } from '../../../types/graphql-schema';
import { createStyles } from '../../../hooks/useTheme';
import Avatar from '../../core/Avatar';
import clsx from 'clsx';
import Button from '../../core/Button';
import Typography from '../../core/Typography';

interface SidebarItemEcoverseProps {
  ecoverse: EcoverseDetailsFragment;
  hideLabel?: boolean;
  centerLabel?: boolean;
}

const useStyles = createStyles(_ => ({
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
}));

const SidebarItemEcoverse: FC<SidebarItemEcoverseProps> = ({ ecoverse, hideLabel, centerLabel }) => {
  const styles = useStyles();
  const tooltip = ecoverse.displayName;
  const ecoverseLogo = ecoverse?.context?.visual?.avatar;

  return (
    <div className={styles.widthFull}>
      <Link to={`/${ecoverse.nameID}`} className={clsx(styles.textDecorationNone, styles.widthFull)}>
        <OverlayTrigger
          offset={[100, 100]}
          placement="right"
          trigger={hideLabel ? ['hover', 'focus'] : []}
          overlay={<Tooltip id={`tooltip-${tooltip.toLowerCase()}`}>{tooltip}</Tooltip>}
        >
          <span className={clsx(styles.wrapper, styles.widthFull)}>
            <Button
              inset
              variant="transparent"
              className={clsx(styles.link, centerLabel ? styles.center : styles.start)}
            >
              <Avatar size="md" src={ecoverseLogo} className={styles.textDecorationNone} />
              {!hideLabel && (
                <>
                  <div style={{ padding: 5 }} />
                  <Typography
                    variant="button"
                    weight="bold"
                    color="inherit"
                    className={clsx(styles.textDecorationNone, styles.textAlignLeft)}
                  >
                    {ecoverse.displayName}
                  </Typography>
                </>
              )}
            </Button>
          </span>
        </OverlayTrigger>
      </Link>
    </div>
  );
};
export default SidebarItemEcoverse;
