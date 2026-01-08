import { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { SvgIconProps, useTheme } from '@mui/material';
import { BlockTitle } from '../typography';
import { gutters } from '../grid/utils';
import RoundedIcon from '../icon/RoundedIcon';
import BadgeCardView from '../list/BadgeCardView';
import Avatar from '../avatar/Avatar';
import ContributorTooltip from '@/domain/community/contributor/ContributorTooltip/ContributorTooltip';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';

type CardTitleSectionProps = {
  title?: ReactNode;
  contrast?: boolean;
  iconComponent?: ComponentType<SvgIconProps>;
  author?: {
    id: string;
    profile: {
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
  contrast,
  author,
  children,
}: PropsWithChildren<CardTitleSectionProps>) => {
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

  const avatar = author?.profile.avatar?.uri ? (
    <ContributorTooltip contributorId={author.id} contributorType={RoleSetContributorType.User}>
      <Avatar size="xsmall" src={author.profile.avatar.uri} alt={author.profile.displayName} />
    </ContributorTooltip>
  ) : undefined;

  return (
    <BadgeCardView
      flexShrink={0}
      visual={iconComponent && <RoundedIcon marginLeft={0.5} size="small" component={iconComponent} />}
      visualRight={avatar}
      height={gutters(3.5)}
      padding
      alignItems="start"
      gap={1}
      contentProps={{ paddingLeft: 0.5 }}
      sx={{
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        ...cardStyle,
      }}
    >
      <BlockTitle
        {...titleStyle}
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </BlockTitle>
      {children}
    </BadgeCardView>
  );
};

export default CardHeader;
