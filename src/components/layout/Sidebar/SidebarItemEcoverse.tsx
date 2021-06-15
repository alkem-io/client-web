import React, { FC } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { EcoverseDetailsFragment } from '../../../types/graphql-schema';
import { createStyles } from '../../../hooks/useTheme';
import Avatar from '../../core/Avatar';
import { LOGO_REFERENCE_NAME } from '../../../models/Constants';

interface SidebarItemEcoverseProps {
  ecoverse: EcoverseDetailsFragment;
}

const useStyles = createStyles(theme => ({
  SidebarItemEcoverse: {
    marginTop: theme.shape.spacing(2),
  },
}));

const SidebarItemEcoverse: FC<SidebarItemEcoverseProps> = ({ ecoverse }) => {
  const styles = useStyles();
  const tooltip = ecoverse.displayName;
  const ecoverseLogo = ecoverse.context?.references?.find(ref => ref.name === LOGO_REFERENCE_NAME)?.uri;

  return (
    <div className={styles.SidebarItemEcoverse}>
      <OverlayTrigger
        offset={[100, 100]}
        placement="right"
        overlay={<Tooltip id={`tooltip-${tooltip.toLowerCase()}`}>{tooltip}</Tooltip>}
      >
        <span>
          <a href={`ecoverses/${ecoverse.nameID}`}>
            <Avatar size="md" src={ecoverseLogo} />
          </a>
        </span>
      </OverlayTrigger>
    </div>
  );
};
export default SidebarItemEcoverse;
