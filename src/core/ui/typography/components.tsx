import { Typography } from '@mui/material';
import provideStaticProps from '../../utils/provideStaticProps';

/**
 * @deprecated - the platform header is Alkemio logo
 */
export const PlatformTitle = provideStaticProps(Typography, { variant: 'h1' });

export const PageTitle = provideStaticProps(Typography, { variant: 'h2' });

export const BlockTitle = provideStaticProps(Typography, { variant: 'h3' });

export const BlockSectionTitle = provideStaticProps(Typography, { variant: 'h4' });

export const Tagline = provideStaticProps(Typography, { variant: 'subtitle1' });

export const Text = provideStaticProps(Typography, { variant: 'body1' });

export const CardText = provideStaticProps(Typography, { variant: 'body2' });

export const Caption = provideStaticProps(Typography, { variant: 'caption', display: 'block' });
