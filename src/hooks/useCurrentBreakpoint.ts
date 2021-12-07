import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const useCurrentBreakpoint = () => {
  const theme = useTheme();
  const xl = useMediaQuery(theme.breakpoints.only('xl'));
  const lg = useMediaQuery(theme.breakpoints.only('lg'));
  const md = useMediaQuery(theme.breakpoints.only('md'));
  const sm = useMediaQuery(theme.breakpoints.only('sm'));
  const xs = useMediaQuery(theme.breakpoints.only('xs'));
  const breakpoints = {
    xl,
    lg,
    md,
    sm,
    xs,
  };

  const current: keyof typeof breakpoints = Object.keys(breakpoints).find(key => breakpoints[key]) || ('xl' as any);

  return current;
};

export default useCurrentBreakpoint;
