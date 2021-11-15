import { ThemeProvider } from '../src/context/ThemeProvider';
import { StyledEngineProvider } from '@mui/material/styles';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

// export const decorators = [muiTheme([defaultTheme])];
export const decorators = [
  Story => (
    <StyledEngineProvider injectFirst>
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    </StyledEngineProvider>
  ),
];
