import { Box, type SvgIconProps } from '@mui/material';
import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import ContributorTooltip from '@/domain/community/contributor/ContributorTooltip/ContributorTooltip';
import Avatar from '../avatar/Avatar';
import { gutters } from '../grid/utils';
import RoundedIcon from '../icon/RoundedIcon';
import BadgeCardView from '../list/BadgeCardView';
import SwapColors from '../palette/SwapColors';
import { BlockTitle } from '../typography';

type CardTitleSectionProps = {
  title?: ReactNode;
  contrast?: boolean;
  iconComponent?: ComponentType<SvgIconProps>;
  author?: {
    id: string;
    profile?: {
      displayName: string;
      avatar?: {
        uri: string;
      };
    };
  };
};

const CardHeader = ({
  iconComponent,
  title = '',
  contrast = false,
  author,
  children,
}: PropsWithChildren<CardTitleSectionProps>) => {
  const avatar = author?.profile?.avatar?.uri ? (
    <ContributorTooltip contributorId={author.id} contributorType={ActorType.User}>
      <Avatar size="xsmall" src={author.profile.avatar.uri} alt={author.profile.displayName} />
    </ContributorTooltip>
  ) : undefined;

  return (
    <BadgeCardView
      flexShrink={0}
      visual={iconComponent && <RoundedIcon marginLeft={0.5} size="small" component={iconComponent} />}
      visualRight={avatar}
      height={gutters(3.5)}
      padding={true}
      alignItems="start"
      gap={1}
      contentProps={{ paddingLeft: 0.5 }}
      sx={theme => ({
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: contrast ? theme.palette.primary.main : undefined,
      })}
    >
      <SwapColors swap={contrast}>
        <BlockTitle
          display="-webkit-box"
          sx={{ WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}
          textOverflow="ellipsis"
          overflow="hidden"
          fontWeight={contrast ? 'bold' : undefined}
          color="textPrimary"
        >
          {title}
        </BlockTitle>
        <Box display="flex" gap={gutters()}>
          {children}
        </Box>
      </SwapColors>
    </BadgeCardView>
  );
};

export default CardHeader;
