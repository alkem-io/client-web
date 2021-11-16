import { TypographyOptions } from '@material-ui/core/styles/createTypography';
import { sourceSansPro, typographyOptions } from '../default/typography';

export const typographyOptionsV2: TypographyOptions = {
  ...typographyOptions,
  h2: { fontFamily: sourceSansPro, fontSize: 36 },
  h3: { fontFamily: sourceSansPro, fontSize: 24 },
  h4: { fontFamily: sourceSansPro, fontSize: 20 },
};
