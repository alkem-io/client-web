import { ThemeProvider } from '@mui/material';
import { defaultTheme } from './default/defaultTheme';
import { PropsWithChildren } from 'react';

const DefaultThemed = ({ children }: PropsWithChildren<{}>) => {
  return <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>;
};

export default DefaultThemed;
