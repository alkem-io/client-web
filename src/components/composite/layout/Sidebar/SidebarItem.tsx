import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import clsx from 'clsx';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
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
  noMarginIcon: {
    margin: 0,
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
      <Tooltip placement="right" id={`tooltip-${tooltip.toLowerCase()}`} title={label}>
        <span style={{ width: '100%', display: 'flex' }}>
          <Button
            inset
            variant="transparent"
            disabled={disabled}
            as={Link}
            to={to}
            className={clsx(styles.link, centerLabel ? styles.center : styles.start)}
            startIcon={<Icon {...iconProps} className={styles.avatarIcon} />}
            text={hideLabel ? '' : label}
            classOverrides={{
              startIcon: clsx(hideLabel && styles.noMarginIcon),
            }}
            {...buttonProps}
          />
        </span>
      </Tooltip>
    </div>
  );
};
export default SidebarItem;
