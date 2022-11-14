import clsx from 'clsx';
import React, { FC, RefObject } from 'react';
import { makeStyles } from '@mui/styles';
import { Box, BoxProps } from '@mui/material';

const useToolbarStyles = makeStyles(theme => ({
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
  },
  paddingDefault: {
    padding: `${theme.spacing(4)} ${theme.spacing(4)}`,
  },
  paddingDense: {
    padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
  },
  responsivePadding: {
    [theme.breakpoints.down('xl')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
}));

interface ToolbarProps extends BoxProps {
  dense?: boolean;
  classes?: {
    padding?: string;
    densePadding?: string;
  };
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  innerRef?: RefObject<any>;
}

const WrapperToolbar: FC<ToolbarProps> = ({ dense, classes, className, innerRef, ...boxProps }) => {
  const styles = useToolbarStyles();

  return (
    <Box
      ref={innerRef}
      className={clsx(
        styles.toolbar,
        classes?.padding || styles.paddingDefault,
        dense && (classes?.densePadding || styles.paddingDense),
        styles.responsivePadding,
        className
      )}
      {...boxProps}
    />
  );
};

export default WrapperToolbar;
