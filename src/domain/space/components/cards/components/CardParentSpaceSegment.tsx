import { LockOutlined } from '@mui/icons-material';
import type { SvgIconProps, SxProps, Theme } from '@mui/material';
import type React from 'react';
import type { ComponentType, PropsWithChildren } from 'react';
import CardSegmentCaption from '@/core/ui/card/CardSegmentCaption';
import RouterLink from '@/core/ui/link/RouterLink';

interface CardParentSpaceSegmentProps {
  iconComponent?: ComponentType<SvgIconProps>;
  parentSpaceUri: string;
  locked?: boolean;
  sx?: SxProps<Theme>;
}

const CardParentSpaceSegment = ({
  iconComponent: Icon,
  parentSpaceUri,
  locked,
  sx,
  children,
}: PropsWithChildren<CardParentSpaceSegmentProps>) => {
  const stopPropagation = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => event.stopPropagation();

  return (
    <CardSegmentCaption
      component={RouterLink}
      to={parentSpaceUri}
      icon={Icon ? <Icon fontSize="small" color="primary" /> : undefined}
      secondaryIcon={locked ? <LockOutlined fontSize="small" color="primary" /> : undefined}
      onClick={stopPropagation}
      disablePadding={true}
      sx={{
        '& .MuiTypography-root': {
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'normal',
        },
        ...sx,
      }}
    >
      {children}
    </CardSegmentCaption>
  );
};

export default CardParentSpaceSegment;
