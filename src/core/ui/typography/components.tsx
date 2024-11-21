import { lighten, Typography, TypographyProps } from '@mui/material';
import provideStaticProps from '@/core/utils/provideStaticProps';

/**
 * @deprecated - the platform header is Alkemio logo
 */
export const PlatformTitle = provideStaticProps(Typography, { variant: 'h1' }) as typeof Typography;

export const PageTitle = provideStaticProps(Typography, { variant: 'h2' }) as typeof Typography;

export const BlockTitle = provideStaticProps(Typography, { variant: 'h3' }) as typeof Typography;

export const BlockSectionTitle = provideStaticProps(Typography, { variant: 'h4' }) as typeof Typography;

export const Tagline = provideStaticProps(Typography, {
  variant: 'subtitle1',
  component: 'h3',
} as TypographyProps) as typeof Typography;

export const Text = provideStaticProps(Typography, { variant: 'body1' }) as typeof Typography;

export const CardTitle = provideStaticProps(Typography, {
  fontWeight: 'bold',
}) as typeof Typography;

export const CardText = provideStaticProps(Typography, {
  variant: 'body2',
  color: theme => lighten(theme.palette.text.primary, 0.4),
}) as typeof Typography;

export const RibbonText = provideStaticProps(Typography, {
  variant: 'body2',
  textAlign: 'center',
  textTransform: 'uppercase',
}) as typeof Typography;

export const Caption = provideStaticProps(Typography, { variant: 'caption', display: 'block' }) as typeof Typography;

export const CaptionSmall = provideStaticProps(Caption, {
  variant: 'caption',
  display: 'block',
  fontStyle: 'italic',
}) as typeof Typography;
