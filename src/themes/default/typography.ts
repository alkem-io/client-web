import { TypographyVariant } from '@mui/material/styles';
import { TypographyOptions } from '@mui/material/styles/createTypography';

export const monserrat = '"MONTSERRAT"';
export const sourceSansPro = '"Source Sans Pro"';

export const typographyOptions: TypographyOptions = {
  h1: { fontFamily: monserrat, fontSize: '2.125rem', fontWeight: 600 },
  h2: { fontFamily: monserrat, fontSize: '1.825rem', fontWeight: 600 },
  h3: { fontFamily: monserrat, fontSize: '1.625rem', fontWeight: 600 },
  h4: { fontFamily: monserrat, fontSize: '1.375rem' },
  h5: { fontFamily: sourceSansPro, fontSize: '1.125rem' },
  h6: { fontFamily: sourceSansPro, fontSize: '1rem' },
  caption: { fontFamily: monserrat },
  button: { fontFamily: monserrat },
  fontFamily: sourceSansPro,
};
declare module '@mui/material/styles/createTypography' {
  interface TypographyOptions
    extends Partial<Record<TypographyVariant | 'body', TypographyStyleOptions> & FontStyleOptions> {}
}
