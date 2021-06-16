import React, { FC } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import IconButton from '../../core/IconButton';
import { Link } from 'react-router-dom';
import Icon from '../../core/Icon';

interface SidebarItemProps {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  to: string;
  tooltip: string;
  disabled?: boolean;
}

const SidebarItem: FC<SidebarItemProps> = ({ icon, to, tooltip, disabled }) => {
  return (
    <div id="sidebarItem">
      <OverlayTrigger
        offset={[100, 100]}
        placement="right"
        overlay={<Tooltip id={`tooltip-${tooltip.toLowerCase()}`}>{tooltip}</Tooltip>}
      >
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
