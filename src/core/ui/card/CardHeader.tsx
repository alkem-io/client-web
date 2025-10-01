import { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { SvgIconProps } from '@mui/material';
import { BlockTitle } from '../typography';
import { gutters } from '../grid/utils';
import RoundedIcon from '../icon/RoundedIcon';
import BadgeCardView from '../list/BadgeCardView';

type CardTitleSectionProps = {
  title?: ReactNode;
  contrast?: boolean;
  iconComponent?: ComponentType<SvgIconProps>;
};

const CardHeader = ({ iconComponent, title = '', contrast: contrast, children }: PropsWithChildren<CardTitleSectionProps>) => {

  return (
    <BadgeCardView
      flexShrink={0}
      visual={iconComponent && <RoundedIcon marginLeft={0.5} size="small" component={iconComponent} swapColors={contrast} />}
      height={gutters(3)}
      paddingX={1}
      gap={1}
      contentProps={{ paddingLeft: 0.5 }}
      sx={{
        borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
        backgroundColor: contrast ? theme => theme.palette.primary.main : undefined
      }}
    >
      <BlockTitle noWrap color={contrast ? 'white' : undefined} fontWeight={contrast ? 'bold' : undefined}>{title}</BlockTitle>
      {children}
    </BadgeCardView >

  );
};

export default CardHeader;
