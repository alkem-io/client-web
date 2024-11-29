import { Help } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

interface HelpButtonProps {
  helpText: string;
  fontSize?: 'inherit' | 'large' | 'medium' | 'small';
}

const HelpButton = ({ helpText, fontSize = 'small' }: HelpButtonProps) => {
  return (
    <Tooltip title={helpText} arrow placement="right">
      <Help color="primary" sx={{ ml: 1 }} fontSize={fontSize} />
    </Tooltip>
  );
};

export default HelpButton;
