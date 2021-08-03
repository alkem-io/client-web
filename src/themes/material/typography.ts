import { TypographyOptions } from '@material-ui/core/styles/createTypography';
import { defaultTypography } from '../defaults';

export const typographyOptions: TypographyOptions = {
  fontFamily: '"MONTSERRAT"',
  h1: {
    font: defaultTypography.h1.font,
    size: defaultTypography.h1.size,
  },
  h2: {
    font: defaultTypography.h2.font,
    size: defaultTypography.h2.size,
  },
  h3: {
    font: defaultTypography.h3.font,
    size: defaultTypography.h3.size,
  },
  h4: {
    font: defaultTypography.h4.font,
    size: defaultTypography.h4.size,
  },
  h5: {
    font: defaultTypography.h5.font,
    size: defaultTypography.h5.size,
  },
  caption: {
    font: defaultTypography.caption.font,
    size: defaultTypography.caption.size,
  },
  body1: {
    font: defaultTypography.body.font,
    size: defaultTypography.body.size,
  },
  body2: {
    font: defaultTypography.body.font,
    size: defaultTypography.body.size,
  },
  button: {
    font: defaultTypography.button.font,
    size: defaultTypography.button.size,
  },
};
