import DesignServicesIcon from '@mui/icons-material/DesignServices';
import { Box, Skeleton, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CardFooterCountWithBadge from '@/core/ui/card/CardFooterCountWithBadge';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { Caption, BlockTitle } from '@/core/ui/typography';
import { CommunityGuidelinesIcon } from '@/domain/community/communityGuidelines/icon/CommunityGuidelinesIcon';
import { PostIcon } from '@/domain/collaboration/post/icon/PostIcon';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import InnovationPackIcon from '../InnovationPackIcon';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import ActionsMenu from '@/core/ui/card/ActionsMenu';
import OneLineMarkdown from '@/core/ui/markdown/OneLineMarkdown';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { SpaceIcon } from '@/domain/journey/space/icon/SpaceIcon';
import { RoundedBadgeSize } from '@/core/ui/icon/RoundedBadge';

export interface InnovationPackCardHorizontalProps {
  profile: {
    displayName: string;
    description?: string;
    url: string;
  };
  templates?: {
    calloutTemplatesCount?: number;
    collaborationTemplatesCount?: number;
    communityGuidelinesTemplatesCount?: number;
    postTemplatesCount?: number;
    whiteboardTemplatesCount?: number;
  };
  actions?: React.ReactNode;
  size?: RoundedBadgeSize;
}

export const InnovationPackCardHorizontalSkeleton = () => {
  const theme = useTheme();
  return (
    <BadgeCardView visual={<Skeleton height={gutters(2)(theme)} width={gutters(2)(theme)} variant="circular" />}>
      <Skeleton />
      <Skeleton />
    </BadgeCardView>
  );
};

const InnovationPackCardHorizontal = ({
  profile: { displayName, description, url },
  templates,
  actions = undefined,
  size = 'medium',
}: InnovationPackCardHorizontalProps) => {
  const { t } = useTranslation();

  const {
    calloutTemplatesCount,
    collaborationTemplatesCount,
    communityGuidelinesTemplatesCount,
    postTemplatesCount,
    whiteboardTemplatesCount,
  } = templates ?? {};

  const totalTemplatesCount =
    (calloutTemplatesCount ?? 0) +
    (collaborationTemplatesCount ?? 0) +
    (communityGuidelinesTemplatesCount ?? 0) +
    (postTemplatesCount ?? 0) +
    (whiteboardTemplatesCount ?? 0);

  return (
    <BadgeCardView
      visual={
        <RoundedIcon
          size={size}
          component={InnovationPackIcon}
          sx={{
            color: theme => theme.palette.neutral.light,
            background: theme => theme.palette.background.paper,
          }}
        />
      }
      component={RouterLink}
      to={url ?? ''}
      actions={actions && <ActionsMenu>{actions}</ActionsMenu>}
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexDirection="column">
          <BlockTitle>{displayName}</BlockTitle>
          <OneLineMarkdown>{description ?? ''}</OneLineMarkdown>
        </Box>
      </Box>
      {totalTemplatesCount > 0 && (
        <Box display="flex" gap={gutters(0.5)} height={gutters(2)} alignItems="center" justifyContent="start">
          {!!calloutTemplatesCount && (
            <CardFooterCountWithBadge
              iconComponent={DesignServicesIcon}
              tooltip={t(`common.enums.templateType.${TemplateType.Callout}_plural`)}
            >
              <Caption>{calloutTemplatesCount}</Caption>
            </CardFooterCountWithBadge>
          )}
          {!!whiteboardTemplatesCount && (
            <CardFooterCountWithBadge
              iconComponent={WhiteboardIcon}
              tooltip={t(`common.enums.templateType.${TemplateType.Whiteboard}_plural`)}
            >
              <Caption>{whiteboardTemplatesCount}</Caption>
            </CardFooterCountWithBadge>
          )}
          {!!communityGuidelinesTemplatesCount && (
            <CardFooterCountWithBadge
              iconComponent={CommunityGuidelinesIcon}
              tooltip={t(`common.enums.templateType.${TemplateType.CommunityGuidelines}_plural`)}
            >
              <Caption>{communityGuidelinesTemplatesCount}</Caption>
            </CardFooterCountWithBadge>
          )}
          {!!postTemplatesCount && (
            <CardFooterCountWithBadge
              iconComponent={PostIcon}
              tooltip={t(`common.enums.templateType.${TemplateType.Post}_plural`)}
            >
              <Caption>{postTemplatesCount}</Caption>
            </CardFooterCountWithBadge>
          )}
          {!!collaborationTemplatesCount && (
            <CardFooterCountWithBadge
              tooltip={t(`common.enums.templateType.${TemplateType.Collaboration}_plural`)}
              iconComponent={SpaceIcon}
            >
              <Caption>{collaborationTemplatesCount}</Caption>
            </CardFooterCountWithBadge>
          )}
          {/* {totalTemplatesCount === 0 && <Caption>{t('pages.admin.generic.sections.account.noTemplates')}</Caption>} */}
        </Box>
      )}
    </BadgeCardView>
  );
};

export default InnovationPackCardHorizontal;
