import clsx from 'clsx';
import React, { FC } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import Button, { ButtonProps } from '../../../core/Button';
import Icon, { IconProps } from '../../../core/Icon';

const useStyles = makeStyles(theme => ({
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
  avatarIcon: {
    width: theme.spacing(4),
  },
}));

interface SidebarItemProps {
  iconProps: IconProps;
  buttonProps?: ButtonProps;
  to: string;
  label: string;
  hideLabel?: boolean;
  centerLabel?: boolean;
  tooltip: string;
  disabled?: boolean;
}

const SidebarItem: FC<SidebarItemProps> = ({
  iconProps,
  to,
  label,
  hideLabel,
  centerLabel,
  tooltip,
  disabled,
  buttonProps,
}) => {
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
            startIcon={<Icon {...iconProps} className={styles.avatarIcon} />}
            text={label}
            {...buttonProps}
          />
        </span>
      </OverlayTrigger>
    </div>
  );
};
export default SidebarItem;
