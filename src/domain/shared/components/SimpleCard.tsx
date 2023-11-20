import React, { ComponentType, ReactNode } from 'react';
import withElevationOnHover from './withElevationOnHover';
import { Box, Paper, SvgIconProps } from '@mui/material';
import LinkNoUnderline from './LinkNoUnderline';
import Icon, { IconProps } from '../../../core/ui/icon/Icon';
import IconLabel from './IconLabel';
import { LinkWithState } from '../types/LinkWithState';

const ElevatedPaper = withElevationOnHover(Paper);

const ImagePreview = ({ src }: { src: string }) => {
  // TODO: This image will not report an error if it cannot load
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
  title?: ReactNode;
  imageUrl?: string;
  iconComponent?: ComponentType<SvgIconProps>;
}

const SimpleCard = ({ title, imageUrl, iconComponent, ...linkProps }: SimpleCardProps) => {
  return (
    <LinkNoUnderline {...linkProps}>
      <ElevatedPaper
        sx={{
          width: theme => theme.spacing(theme.cards.simpleCard.width),
          height: theme => theme.spacing(theme.cards.simpleCard.height),
          background: theme => theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {imageUrl ? (
          <ImagePreview src={imageUrl} />
        ) : iconComponent ? (
          <PositionedIcon iconComponent={iconComponent} />
        ) : null}
        <IconLabel>{title}</IconLabel>
      </ElevatedPaper>
    </LinkNoUnderline>
  );
};

export default SimpleCard;
