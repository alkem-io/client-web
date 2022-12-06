import { TypographyOptions } from '@mui/material/styles/createTypography';
import { gutter } from '../grid/constants';
import { rem } from './utils';

export const fontFamilyMontserrat = '"Montserrat", sans-serif';
export const fontFamilySourceSans = '"Source Sans Pro", sans-serif';

const fontWeightRegular = 400;
const fontWeightMedium = 500;
const fontWeightBold = 700;

const lineHeightSingle = rem(gutter);
const lineHeightDouble = rem(gutter * 2);

export const typographyOptions: TypographyOptions = {
  h1: {
    fontFamily: fontFamilyMontserrat,
    fontSize: rem(25),
    fontWeight: fontWeightBold,
    lineHeight: lineHeightDouble,
  },
  h2: {
    fontFamily: fontFamilyMontserrat,
    fontSize: rem(18),
    fontWeight: fontWeightBold,
    lineHeight: lineHeightSingle,
  },
  h3: {
    fontFamily: fontFamilyMontserrat,
    fontSize: rem(15),
    fontWeight: fontWeightRegular,
    lineHeight: lineHeightSingle,
  },
  h4: {
    fontFamily: fontFamilyMontserrat,
    fontSize: rem(12),
    fontWeight: fontWeightRegular,
    lineHeight: lineHeightSingle,
  },
  subtitle1: {
    fontFamily: fontFamilyMontserrat,
    fontSize: rem(16),
    fontWeight: fontWeightRegular,
    lineHeight: lineHeightSingle,
    fontStyle: 'italic',
  },
  body1: {
    fontFamily: fontFamilySourceSans,
    fontSize: rem(14),
    fontWeight: fontWeightRegular,
    lineHeight: lineHeightSingle,
  },
  body2: {
    fontFamily: fontFamilySourceSans,
    fontSize: rem(12),
    fontWeight: fontWeightRegular,
    lineHeight: lineHeightSingle,
  },
  button: {
    fontFamily: fontFamilyMontserrat,
    fontSize: rem(12),
    fontWeight: fontWeightMedium,
    lineHeight: lineHeightSingle,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: fontFamilyMontserrat,
    fontSize: rem(12),
    fontWeight: fontWeightRegular,
    lineHeight: lineHeightSingle,
  },
};
