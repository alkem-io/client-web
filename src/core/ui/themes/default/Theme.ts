import { createTheme } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';
import componentsOverride from './components';
import { paletteOptions } from '../../palette/palette';
import { themeTypographyOptions } from '../../typography/themeTypographyOptions';

// use theme constant instead of these
const SPACING = 10;
const AVATAR_SIZE_XS = 4;
const AVATAR_SIZE = 7;
const AVATAR_SIZE_LG = 9;

const defaultTheme = createTheme();

export const themeOptions: ThemeOptions = {
  palette: paletteOptions,
  typography: themeTypographyOptions,
  shape: { borderRadius: 12 },
  spacing: SPACING,
  cards: {
    search: {
      width: 258,
      contributor: {
        height: 418,
        imgHeight: 264,
      },
    },
    simpleCard: {
      width: 32,
      height: 18,
    },
    contributionCard: {
      width: 32,
      height: 18,
    },
  },
  avatarSizeXs: SPACING * AVATAR_SIZE_XS,
  avatarSize: SPACING * AVATAR_SIZE,
  avatarSizeLg: SPACING * AVATAR_SIZE_LG,
  components: componentsOverride as ThemeOptions['components'],
  breakpoints: {
    values: {
      ...defaultTheme.breakpoints.values,
      md: 1100,
    },
  },
};

export const theme = createTheme(themeOptions);

declare module '@mui/material/styles' {
  interface Theme {
    cards: {
      search: {
        width: number;
        contributor: {
          height: number;
          imgHeight: number;
        };
      };
      simpleCard: {
        width: number;
        height: number;
      };
      contributionCard: {
        width: number;
        height: number;
      };
    };
    avatarSizeXs: number;
    avatarSize: number;
    avatarSizeLg: number;
  }

  interface ThemeOptions extends Theme {}
}

declare module '@mui/material' {
  interface Color {
    main: string;
    dark: string;
  }
}
