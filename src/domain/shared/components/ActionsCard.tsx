import React, { ComponentType } from 'react';
import withElevationOnHover from './withElevationOnHover';
import { Box, Paper, SvgIconProps } from '@mui/material';
/*import LinkNoUnderline from './LinkNoUnderline';
import Icon, { IconProps } from './Icon';
import IconLabel from './IconLabel';
*/
import { ClampedTypography } from './ClampedTypography';

const ElevatedPaper = withElevationOnHover(Paper);

/*const ImagePreview = ({ src }: { src: string }) => {
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

*/
interface TitleBarProps {
  title: string;
  iconComponent?: ComponentType<SvgIconProps>;
  provider?: string;
  providerLogo?: string;
}
const TitleBar = ({ title, iconComponent }: TitleBarProps) => {
  /// <PositionedIcon iconComponent={iconComponent} />
  return (
    <Box sx={{ display: 'flex' }}>
      <Box sx={{ flex: 0, width: theme => theme.spacing(3) }}>{iconComponent ? iconComponent : undefined}</Box>
      <ClampedTypography clamp={1}>{title}</ClampedTypography>
    </Box>
  );
};

export interface ActionsCardProps extends TitleBarProps {
  imageUrl?: string;
  onClick?: () => void; //??
}

const ActionsCard = (props: ActionsCardProps) => {
  return (
    <ElevatedPaper
      sx={{
        background: theme => theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
    >
      <TitleBar {...props} />
    </ElevatedPaper>
  );
};

export default ActionsCard;
