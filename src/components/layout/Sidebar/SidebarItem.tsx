import React, { FC } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import IconButton from '../../core/IconButton';
import { Link } from 'react-router-dom';
import Icon, { IconProps } from '../../core/Icon';
import { Typography } from '@material-ui/core';
import { createStyles } from '../../../hooks/useTheme';

const useStyles = createStyles(theme => ({
  link: {
    alignItems: 'center',
    justifyContent: 'center',
    '& > *': {
      margin: `${theme.shape.spacing(0.5)}px ${theme.shape.spacing(1)}px`,
    },
  },
}));

interface SidebarItemProps {
  iconProps: IconProps;
  to: string;
  label: string;
  hideLabel?: boolean;
  tooltip: string;
  disabled?: boolean;
}

const SidebarItem: FC<SidebarItemProps> = ({ iconProps, to, label, hideLabel, tooltip, disabled }) => {
  const styles = useStyles();
  return (
    <div>
      <OverlayTrigger
        offset={[100, 100]}
        placement="right"
        trigger={hideLabel ? ['hover', 'focus'] : []}
        overlay={<Tooltip id={`tooltip-${tooltip.toLowerCase()}`}>{tooltip}</Tooltip>}
      >
        <span>
          <IconButton disabled={disabled} as={Link} to={to} className={styles.link}>
            <Icon {...iconProps} />
            {label && !hideLabel && (
              <Typography variant="button" color="inherit">
                {label}
              </Typography>
            )}
          </IconButton>
        </span>
      </OverlayTrigger>
    </div>
  );
};
export default SidebarItem;
