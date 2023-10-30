import { createTheme, Theme } from '@mui/material';
import produce from 'immer';

const providePrimaryColor = (color: string | ((theme: Theme) => string)) => (theme: Theme) =>
  createTheme(
    produce(theme, nextTheme => {
      nextTheme.palette.primary.main = typeof color === 'function' ? color(theme) : color;
    })
  );

export default providePrimaryColor;
