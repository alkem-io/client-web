import { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { SvgIconProps, useTheme } from '@mui/material';
import { BlockTitle } from '../typography';
import { gutters } from '../grid/utils';
import RoundedIcon from '../icon/RoundedIcon';
import BadgeCardView from '../list/BadgeCardView';

type CardTitleSectionProps = {
  title?: ReactNode;
  contrast?: boolean;
  iconComponent?: ComponentType<SvgIconProps>;
};

const CardHeader = ({ iconComponent, title = '', contrast, children }: PropsWithChildren<CardTitleSectionProps>) => {
  const theme = useTheme();

  const cardStyle = contrast
    ? {
        backgroundColor: theme.palette.primary.main,
      }
    : undefined;

  const titleStyle = contrast
    ? {
        color: theme.palette.background.paper,
        fontWeight: 'bold',
      }
    : undefined;

  return (
    <BadgeCardView
      flexShrink={0}
      visual={iconComponent && <RoundedIcon marginLeft={0.5} size="small" component={iconComponent} />}
      height={gutters(3)}
      paddingX={1}
      gap={1}
      contentProps={{ paddingLeft: 0.5 }}
      sx={{
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        ...cardStyle,
      }}
    >
      <BlockTitle noWrap {...titleStyle}>
        {title}
      </BlockTitle>
      {children}
    </BadgeCardView>
  );
};

export default CardHeader;
