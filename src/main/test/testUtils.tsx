import i18n from '@/core/i18n/config';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import { render, RenderOptions } from '@testing-library/react';
import { FC, PropsWithChildren, ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

const AllTheProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <RootThemeProvider>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </RootThemeProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
