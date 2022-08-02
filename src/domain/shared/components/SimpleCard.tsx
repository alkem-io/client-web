import React, { ComponentType, ReactNode } from 'react';
import withElevationOnHover from './withElevationOnHover';
import { Box, Paper, SvgIconProps } from '@mui/material';
import LinkNoUnderline from './LinkNoUnderline';
import Icon, { IconProps } from './Icon';
import IconLabel from './IconLabel';
import { LinkWithState } from '../types/LinkWithState';

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

export interface SimpleCardProps extends LinkWithState {
  title: ReactNode;
  imageUrl: string | undefined;
  iconComponent: ComponentType<SvgIconProps>;
}

const SimpleCard = ({ url, state, title, imageUrl, iconComponent }: SimpleCardProps) => {
  return (
    <LinkNoUnderline to={url} state={state}>
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

export default SimpleCard;
