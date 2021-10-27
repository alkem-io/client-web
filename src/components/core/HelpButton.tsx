import { createStyles, makeStyles, Tooltip } from '@material-ui/core';
import { Help } from '@material-ui/icons';
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
