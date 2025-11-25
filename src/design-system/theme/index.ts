import { createTheme, PaletteOptions } from '@mui/material/styles';
import { palette, typography, spacing } from '../tokens';

export const theme = createTheme({
  palette: palette as PaletteOptions,
  typography,
  spacing,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);
