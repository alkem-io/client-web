import { Typography } from '@material-ui/core';
import clsx from 'clsx';
import React, { FC } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { createStyles } from '../../../hooks/useTheme';
import Button from '../../core/Button';
import Icon, { IconProps } from '../../core/Icon';

const useStyles = createStyles(_ => ({
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

interface SidebarItemProps {
  iconProps: IconProps;
  to: string;
  label: string;
  hideLabel?: boolean;
  centerLabel?: boolean;
  tooltip: string;
  disabled?: boolean;
}

const SidebarItem: FC<SidebarItemProps> = ({ iconProps, to, label, hideLabel, centerLabel, tooltip, disabled }) => {
  const styles = useStyles();
  return (
    <div style={{ width: '100%' }}>
      <OverlayTrigger
        offset={[100, 100]}
        placement="right"
        trigger={hideLabel ? ['hover', 'focus'] : []}
        overlay={<Tooltip id={`tooltip-${tooltip.toLowerCase()}`}>{tooltip}</Tooltip>}
      >
        <span style={{ width: '100%', display: 'flex' }}>
          <Button
            inset
            variant="transparent"
            disabled={disabled}
            as={Link}
            to={to}
            className={clsx(styles.link, centerLabel ? styles.center : styles.start)}
          >
            <Icon {...iconProps} />
            {label && !hideLabel && (
              <>
                <div style={{ padding: 5 }} />
                <Typography variant="button" color="inherit">
                  {label}
                </Typography>
              </>
            )}
          </Button>
        </span>
      </OverlayTrigger>
    </div>
  );
};
export default SidebarItem;
