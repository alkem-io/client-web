import React, { FC } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import IconButton from '../../core/IconButton';
import { Link } from 'react-router-dom';
import Icon from '../../core/Icon';
import { createStyles } from '../../../hooks/useTheme';

interface SidebarItemProps {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  to: string;
  tooltip: string;
  disabled?: boolean;
}

const useStyles = createStyles(theme => ({
  sidebarItem: {
    marginTop: theme.shape.spacing(1),
    marginBottom: theme.shape.spacing(1),
  },
}));

const SidebarItem: FC<SidebarItemProps> = ({ icon, to, tooltip, disabled }) => {
  const styles = useStyles();
  return (
    <div className={styles.sidebarItem}>
      <OverlayTrigger placement="right" overlay={<Tooltip id={`tooltip-${tooltip.toLowerCase()}`}>{tooltip}</Tooltip>}>
        <span>
          <IconButton disabled={disabled} as={Link} to={to}>
            <Icon component={icon} color="inherit" size="lg" />
          </IconButton>
        </span>
      </OverlayTrigger>
    </div>
  );
};
export default SidebarItem;
