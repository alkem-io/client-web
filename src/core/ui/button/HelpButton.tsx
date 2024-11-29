import { Help } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

interface HelpButtonProps {
  helpText: string;
  fontSize?: 'inherit' | 'large' | 'medium' | 'small';
}

export const HelpButton = ({ helpText, fontSize = 'small' }: HelpButtonProps) => {
  return (
    <Tooltip title={helpText} arrow placement="right">
      <Help
        color="primary"
        sx={theme => ({
          icon: {
            marginLeft: theme.spacing(1),
          },
        })}
        fontSize={fontSize}
      />
    </Tooltip>
  );
};

export default HelpButton;
