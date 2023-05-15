import React, { ComponentType, ReactNode } from 'react';
import withElevationOnHover from './withElevationOnHover';
import { Box, Paper, SvgIconProps } from '@mui/material';
import Icon, { IconProps } from '../../../core/ui/icon/Icon';
import IconLabel from './IconLabel';
import ConditionalLink, { ConditionalLinkProps } from '../../../common/components/core/ConditionalLink';

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

export interface SimpleCardProps extends ConditionalLinkProps {
  title?: ReactNode;
  imageUrl?: string;
  iconComponent?: ComponentType<SvgIconProps>;
  onClick?: (event: React.MouseEvent) => void;
}

const SimpleCard = ({ title, imageUrl, iconComponent, ...linkProps }: SimpleCardProps) => {
  return (
    <ConditionalLink {...linkProps}>
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
    </ConditionalLink>
  );
};

export default SimpleCard;
