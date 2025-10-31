import { createTheme } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';
import componentsOverride from './components';
import { paletteOptions } from '@/core/ui/palette/palette';
import { themeTypographyOptions } from '@/core/ui/typography/themeTypographyOptions';

// use theme constant instead of these
const SPACING = 10;
const AVATAR_SIZE_XS = 4;
const AVATAR_SIZE = 7;
const AVATAR_SIZE_LG = 9;

const defaultTheme = createTheme();

export const themeOptions: ThemeOptions = {
  palette: paletteOptions,
  typography: themeTypographyOptions,
  shape: { borderRadius: 12, borderRadiusSquare: 6 },
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
  whiteboards: {
    defaultStrokeColor: '#000000',
    defaultStrokeStyle: 'solid',
    defaultStrokeWidth: 1,
    defaultBackgroundColor: '#FFFFFF',
    defaultFillStyle: 'solid',
    defaultFontFamily: 2,
    defaultFontSize: 20,
    defaultTextAlign: 'left',
    defaultRoughness: 0,
    defaultRoundness: 'sharp',
    defaultOpacity: 100,
    defaultEndArrowhead: 'triangle',
    defaultChartType: 'line',
  },
} as ThemeOptions;

export const theme = createTheme(themeOptions);

declare module '@mui/system/createTheme/shape' {
  interface Shape {
    borderRadiusSquare: number;
  }
}

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
    whiteboards: {
      defaultStrokeColor: string;
      defaultStrokeStyle: 'solid' | 'dashed' | 'dotted';
      defaultStrokeWidth: number;
      defaultBackgroundColor: string;
      defaultFillStyle: 'hachure' | 'cross-hatch' | 'solid' | 'zigzag';
      defaultFontFamily: number; // Font: 1 = Hand-drawn (Virgil), 2 = Normal (Helvetica), 2 = Code (Cascadia), 4 = (not in the toolbar) Assistant
      defaultFontSize: number;
      defaultTextAlign: 'left' | 'right';
      defaultRoughness: number; // Sloppiness (0 = Architect, 1 = Artist, 2 = Cartoonist)
      defaultRoundness: 'round' | 'sharp';
      defaultOpacity: number;
      defaultEndArrowhead: 'arrow' | 'bar' | 'dot' | 'triangle';
      defaultChartType: 'bar' | 'line';
    };
  }

  interface ThemeOptions extends Theme {}
}

declare module '@mui/material' {
  interface Color {
    main: string;
    dark: string;
  }
}
