import { lighten, Typography, TypographyProps } from '@mui/material';
import provideStaticProps from '@/core/utils/provideStaticProps';

export const PageTitle = provideStaticProps<TypographyProps, HTMLHeadingElement>(Typography, {
  variant: 'h2',
  component: 'h1',
}) as typeof Typography;

export const BlockTitle = provideStaticProps<TypographyProps, HTMLHeadingElement>(Typography, {
  variant: 'h3',
  component: 'h2',
}) as typeof Typography;

export const BlockSectionTitle = provideStaticProps<TypographyProps, HTMLHeadingElement>(Typography, {
  variant: 'h4',
  component: 'h3',
}) as typeof Typography;

export const Tagline = provideStaticProps<TypographyProps, HTMLHeadingElement>(Typography, {
  variant: 'subtitle1',
  component: 'h4',
} as TypographyProps) as typeof Typography;

export const Text = provideStaticProps<TypographyProps, HTMLParagraphElement>(Typography, {
  variant: 'body1',
}) as typeof Typography;

export const CardTitle = provideStaticProps<TypographyProps, HTMLHeadingElement>(Typography, {
  fontWeight: 'bold',
}) as typeof Typography;

export const CardText = provideStaticProps<TypographyProps, HTMLDivElement>(Typography, {
  variant: 'body2',
  component: 'div',
  sx: { color: theme => lighten(theme.palette.text.primary, 0.4) },
}) as typeof Typography;

export const RibbonText = provideStaticProps<TypographyProps, HTMLParagraphElement>(Typography, {
  variant: 'body2',
  textAlign: 'center',
  textTransform: 'uppercase',
}) as typeof Typography;

export const Caption = provideStaticProps<TypographyProps, HTMLParagraphElement>(Typography, {
  variant: 'caption',
  display: 'block',
}) as typeof Typography;

export const CaptionSmall = provideStaticProps<TypographyProps, HTMLParagraphElement>(Caption, {
  variant: 'caption',
  display: 'block',
  fontStyle: 'italic',
}) as typeof Typography;
