import { Theme } from '@mui/material/styles';
import { render, RenderOptions } from '@testing-library/react';
import React, { FC, ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '../../../context/ThemeProvider';
import i18n from '../../../core/i18n/config';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const AllTheProviders: FC = ({ children }) => {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
