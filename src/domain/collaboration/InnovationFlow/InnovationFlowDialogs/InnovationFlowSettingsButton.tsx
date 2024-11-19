import { useState } from 'react';
import { ButtonProps } from '@mui/material';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import InnovationFlowSettingsDialog from './InnovationFlowSettingsDialog';
import { CalloutGroupNameValuesMap } from '@/domain/collaboration/callout/CalloutsInContext/CalloutsGroup';
import { SvgIconComponent } from '@mui/icons-material';

interface InnovationFlowSettingsButtonProps extends ButtonProps {
  collaborationId: string;
  templatesSetId: string | undefined;
  filterCalloutGroups: CalloutGroupNameValuesMap[];
  tooltip: string;
  icon: SvgIconComponent;
}

const InnovationFlowSettingsButton = ({
  collaborationId,
  templatesSetId,
  filterCalloutGroups,
  icon: SettingsIcon,
  tooltip,
  ...props
}: InnovationFlowSettingsButtonProps) => {
  const [isSettingsDialogOpen, setSettingsDialogOpen] = useState(false);

  return (
    <>
      <ButtonWithTooltip
        tooltip={tooltip}
        variant="outlined"
        iconButton
        {...props}
        onClick={() => setSettingsDialogOpen(true)}
      >
        {SettingsIcon && <SettingsIcon />}
      </ButtonWithTooltip>
      <InnovationFlowSettingsDialog
        open={isSettingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        collaborationId={collaborationId}
        filterCalloutGroups={filterCalloutGroups}
      />
    </>
  );
};

export default InnovationFlowSettingsButton;
