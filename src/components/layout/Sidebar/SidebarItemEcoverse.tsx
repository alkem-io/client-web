import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { EcoverseDetailsFragment } from '../../../types/graphql-schema';
import { createStyles } from '../../../hooks/useTheme';
import Avatar from '../../core/Avatar';

interface SidebarItemEcoverseProps {
  ecoverse: EcoverseDetailsFragment;
}

const useStyles = createStyles(() => ({
  textDecorationNone: {
    textDecoration: 'none',
  },
}));

const SidebarItemEcoverse: FC<SidebarItemEcoverseProps> = ({ ecoverse }) => {
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
          <span>
            <Avatar size="md" src={ecoverseLogo} />
          </span>
        </OverlayTrigger>
      </Link>
    </div>
  );
};
export default SidebarItemEcoverse;
