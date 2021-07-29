import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';

interface SpacerProps {
  variant?: 'lg' | 'md';
}

const useSpacerStyles = createStyles(theme => ({
  mdSpacer: {
    marginTop: theme.shape.spacing(2),
  },
  lgSpacer: {
    marginTop: theme.shape.spacing(4),
  },
}));

export const Spacer: FC<SpacerProps> = ({ variant = 'md' }) => {
  const styles = useSpacerStyles();

  return <div className={styles[`${variant}Spacer`]}></div>;
};
