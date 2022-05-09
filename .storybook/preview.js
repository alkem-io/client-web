import { ThemeProvider } from '@mui/material/styles';
import { ThemeProvider as Emotion10ThemeProvider } from 'emotion-theming';
import { defaultTheme } from '../src/common/themes/default';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../src/i18n/config';

const withThemeProvider = (Story, context) => {
  return (
    <Emotion10ThemeProvider theme={defaultTheme}>
      <ThemeProvider theme={defaultTheme}>{Story(context)}</ThemeProvider>
    </Emotion10ThemeProvider>
  );
};

const withRoutingProvider = (Story, context) => {
  return <MemoryRouter initialEntries={['/']}>{Story(context)}</MemoryRouter>;
};

export const decorators = [withThemeProvider, withRoutingProvider];

export const parameters = {
  i18n,
  locale: 'en',
  locales: {
    en: 'English',
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
