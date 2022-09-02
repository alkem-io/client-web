import React, { FC } from 'react';
import { makeStyles } from '@mui/styles';

interface SpacerProps {
  variant?: 'lg' | 'md';
}

const useSpacerStyles = makeStyles(theme => ({
  mdSpacer: {
    marginTop: theme.spacing(2),
  },
  lgSpacer: {
    marginTop: theme.spacing(4),
  },
}));

export const Spacer: FC<SpacerProps> = ({ variant = 'md' }) => {
  const styles = useSpacerStyles();

  return <div className={styles[`${variant}Spacer`]}></div>;
};
