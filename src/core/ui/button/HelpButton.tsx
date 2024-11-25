import { Tooltip } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Help } from '@mui/icons-material';

interface HelpButtonProps {
  helpText: string;
  fontSize?: 'inherit' | 'large' | 'medium' | 'small';
}

const useStyles = makeStyles(theme =>
  createStyles({
    icon: {
      marginLeft: theme.spacing(1),
    },
  })
);

export const HelpButton = ({ helpText, fontSize = 'small' }: HelpButtonProps) => {
  const styles = useStyles();
  return (
    <Tooltip title={helpText} arrow placement="right">
      <Help color="primary" className={styles.icon} fontSize={fontSize} />
    </Tooltip>
  );
};

export default HelpButton;
