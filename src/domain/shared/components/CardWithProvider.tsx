import React, { ComponentType, PropsWithChildren } from 'react';
import withElevationOnHover from './withElevationOnHover';
import { Box, Paper, styled, SvgIconProps, Typography } from '@mui/material';
import Icon, { IconProps } from '../../../core/ui/icon/Icon';
import Image from './Image';
import { ClampedTypography } from './ClampedTypography';
import hexToRGBA from '../../../common/utils/hexToRGBA';

const ElevatedPaper = withElevationOnHover(Paper);

interface TitleBarProps {
  title: string;
  iconComponent?: ComponentType<SvgIconProps>;
  provider?: string;
  providerLogoUrl?: string;
}

const TitleBar = ({ iconComponent, title, provider, providerLogoUrl }: TitleBarProps) => {
  return (
    <Box sx={{ display: 'flex' }}>
      {iconComponent ? (
        <RoundedIcon>
          <Icon iconComponent={iconComponent} size="medium" />
        </RoundedIcon>
      ) : null}
      <Box sx={{ flex: 1, padding: theme => theme.spacing(1, 1, 1, 0) }}>
        <ClampedTypography clamp={1} variant="h5">
          {title}
        </ClampedTypography>
        {provider ? (
          <OrganizationWrapper>
            {providerLogoUrl ? <OrganizationLogo src={providerLogoUrl} /> : null}
            <OrganizationName>{provider}</OrganizationName>
          </OrganizationWrapper>
        ) : null}
      </Box>
    </Box>
  );
};

const RoundedIcon = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.dark,
  color: theme.palette.common.white,
  borderRadius: '50%',
  width: theme.spacing(5),
  height: theme.spacing(5),
  margin: theme.spacing(1.5, 2),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const OrganizationWrapper = styled(Box)(() => ({
  display: 'flex',
}));

const OrganizationLogo = styled(Image)(({ theme }) => ({
  flex: 1,
  display: 'inline-block',
  maxWidth: theme.spacing(3),
  maxHeight: theme.spacing(3),
  marginRight: theme.spacing(1),
}));

const OrganizationName = styled(Typography)(() => ({
  display: 'inline',
  textOverflow: 'ellipsis',
}));

const ImageWrapper = styled(Box)(({ theme }) => ({
  aspectRatio: '7/4',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: theme.palette.primary.main,
  '& > svg': {
    fontSize: '3em',
  },
}));

const ImagePreview = ({ src }: { src: string }) => {
  return (
    <Box
      flexGrow={1}
      sx={{
        background: theme => `${hexToRGBA(theme.palette.highlight.main, 0.2)} url('${src}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        aspectRatio: '7/4',
      }}
    />
  );
};

const ExtraInfoBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  color: theme.palette.highlight.contrastText,
  backgroundColor: theme.palette.highlight.main,
}));

export const ExtraInfoWithIcon = ({
  iconComponent,
  children,
}: PropsWithChildren<{ iconComponent?: IconProps['iconComponent'] }>) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {iconComponent ? (
        <Icon iconComponent={iconComponent} sx={{ marginRight: theme => theme.spacing(1) }} size="small" />
      ) : null}
      {children}
    </Box>
  );
};

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'end',
  padding: theme.spacing(2, 1),
}));

export interface CardWithProviderProps extends TitleBarProps {
  imageUrl?: string;
  defaultImage?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  actionButtons?: React.ReactNode[];
  extraInformation?: React.ReactNode;
}

/**
 * Card specially made for Cards/Canvases/Lifecycles with buttons at the bottom
 * @param props
 * @returns
 */
const CardWithProvider = (props: CardWithProviderProps) => {
  const { extraInformation, onClick, imageUrl, defaultImage } = props;
  return (
    <ElevatedPaper
      sx={{
        background: theme => theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <TitleBar {...props} />
      <ImageWrapper>{imageUrl ? <ImagePreview src={imageUrl} /> : defaultImage}</ImageWrapper>
      {extraInformation ? <ExtraInfoBar>{extraInformation}</ExtraInfoBar> : null}
      {props.actionButtons && props.actionButtons.length > 0 && <ActionButtons>{props.actionButtons}</ActionButtons>}
    </ElevatedPaper>
  );
};

export default CardWithProvider;
