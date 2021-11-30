import { Tooltip } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Help } from '@mui/icons-material';
import React, { FC } from 'react';

interface HelpButtonProps {
  helpText: string;
}

const useStyles = makeStyles(theme =>
  createStyles({
    icon: {
      marginLeft: theme.spacing(1),
    },
  })
);

export const HelpButton: FC<HelpButtonProps> = ({ helpText }) => {
  const styles = useStyles();
  return (
    <Tooltip title={helpText} arrow placement="right">
      <Help color="primary" className={styles.icon} fontSize="small" />
    </Tooltip>
  );
};
export default HelpButton;
