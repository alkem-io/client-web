import { useMediaQuery } from '@mui/material';
import { Breakpoint, useTheme } from '@mui/material/styles';
import { findKey } from 'lodash';

/**
 * @deprecated try using useColumns instead
 */
const useCurrentBreakpoint = (): Breakpoint => {
  const theme = useTheme();

  const xl = useMediaQuery(theme.breakpoints.only('xl'));
  const lg = useMediaQuery(theme.breakpoints.only('lg'));
  const md = useMediaQuery(theme.breakpoints.only('md'));
  const sm = useMediaQuery(theme.breakpoints.only('sm'));
  const xs = useMediaQuery(theme.breakpoints.only('xs'));

  const breakpoints: Record<Breakpoint, boolean> = {
    xl,
    lg,
    md,
    sm,
    xs,
  };

  return (findKey(breakpoints) as Breakpoint) ?? 'xl';
};

export default useCurrentBreakpoint;
