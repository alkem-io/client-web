import { TypographyOptions } from '@material-ui/core/styles/createTypography';

export const monserrat = '"MONTSERRAT"';
export const sourceSansPro = '"Source Sans Pro"';

export const typographyOptions: TypographyOptions = {
  h1: { fontFamily: monserrat, fontSize: 48 },
  h2: { fontFamily: monserrat, fontSize: 36 },
  h3: { fontFamily: sourceSansPro, fontSize: 24 },
  h4: { fontFamily: monserrat, fontSize: 22 },
  h5: { fontFamily: sourceSansPro, fontSize: 18 },
  caption: { fontFamily: monserrat, fontSize: 12 },
  body1: { fontFamily: sourceSansPro, fontSize: 16 },
  body2: { fontFamily: sourceSansPro, fontSize: 14 },
  button: { fontFamily: monserrat, fontSize: 14 },
};

declare module '@material-ui/core/styles/createTypography' {
  interface TypographyOptions {
    [key: string]: {
      fontFamily: string;
      fontSize: number;
    };
  }
}
