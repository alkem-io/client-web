import { createTheme, Theme } from '@mui/material';
import produce from 'immer';

const providePrimaryColor = (color: string) => (theme: Theme) =>
  createTheme(
    produce(theme, theme => {
      theme.palette.primary.main = color;
    })
  );

export default providePrimaryColor;
