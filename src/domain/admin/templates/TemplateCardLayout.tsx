import React from 'react';
import withElevationOnHover from '../../shared/components/withElevationOnHover';
import { Box, Paper, Typography } from '@mui/material';
import LinkNoUnderline from '../../shared/components/LinkNoUnderline';
import { TemplateCardProps } from './TemplateCardProps';

const ElevatedPaper = withElevationOnHover(Paper);

const ImagePreview = ({ src }: { src: string }) => {
  const backgroundImage = `url(${src})`;
  return <Box flexGrow={1} sx={{ backgroundImage, backgroundSize: 'cover', backgroundPosition: 'center' }} />;
};

const Icon = ({ iconComponent: IconComponent }: Pick<TemplateCardProps, 'iconComponent'>) => {
  return (
    <Box display="flex" flexGrow={1} justifyContent="center" alignItems="center">
      <IconComponent sx={{ fontSize: theme => theme.spacing(12) }} color="primary" />
    </Box>
  );
};

const TemplateCardLayout = ({ url, linkState, title, imageUrl, iconComponent }: TemplateCardProps) => {
  return (
    <LinkNoUnderline to={url} state={linkState}>
      <ElevatedPaper
        sx={{
          width: theme => theme.spacing(26),
          height: theme => theme.spacing(18),
          background: theme => theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {imageUrl ? <ImagePreview src={imageUrl} /> : <Icon iconComponent={iconComponent} />}
        <Typography variant="body1" color="primary" fontWeight="bold" sx={{ paddingX: 2, paddingY: 1 }} noWrap>
          {title}
        </Typography>
      </ElevatedPaper>
    </LinkNoUnderline>
  );
};

export default TemplateCardLayout;
