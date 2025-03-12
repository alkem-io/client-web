import { ThemeProvider } from '@mui/material';
import { PropsWithChildren } from 'react';
import { theme } from './default/Theme';

const RootThemeProvider = ({ children }: PropsWithChildren) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default RootThemeProvider;
