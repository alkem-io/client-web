import React from 'react';
import withElevationOnHover from '../../shared/components/withElevationOnHover';
import { Box, Paper } from '@mui/material';
import LinkNoUnderline from '../../shared/components/LinkNoUnderline';
import { TemplateCardProps } from './TemplateCardProps';
import Icon, { IconProps } from '../../shared/components/Icon';
import IconLabel from '../../shared/components/IconLabel';

const ElevatedPaper = withElevationOnHover(Paper);

const ImagePreview = ({ src }: { src: string }) => {
  const backgroundImage = `url(${src})`;
  return <Box flexGrow={1} sx={{ backgroundImage, backgroundSize: 'cover', backgroundPosition: 'center' }} />;
};

const PositionedIcon = ({ iconComponent }: Pick<IconProps, 'iconComponent'>) => {
  return (
    <Box display="flex" flexGrow={1} justifyContent="center" alignItems="center">
      <Icon iconComponent={iconComponent} color="primary" size="xxl" />
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
        {imageUrl ? <ImagePreview src={imageUrl} /> : <PositionedIcon iconComponent={iconComponent} />}
        <IconLabel>{title}</IconLabel>
      </ElevatedPaper>
    </LinkNoUnderline>
  );
};

export default TemplateCardLayout;
