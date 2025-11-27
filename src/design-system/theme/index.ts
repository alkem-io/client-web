import { createTheme, PaletteOptions, ThemeOptions } from '@mui/material/styles';
import { palette, typography, spacing } from '../tokens';

export const theme = createTheme({
  palette: palette as PaletteOptions,
  typography,
  spacing,
} as ThemeOptions);
