import DesignServicesIcon from '@mui/icons-material/DesignServices';
import { Box, Skeleton, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CardFooterCountWithBadge from '../../../../core/ui/card/CardFooterCountWithBadge';
import { gutters } from '../../../../core/ui/grid/utils';
import RouterLink from '../../../../core/ui/link/RouterLink';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { Caption, CardTitle } from '../../../../core/ui/typography';
import { CommunityGuidelinesIcon } from '../../communityGuidelines/icon/CommunityGuidelinesIcon';
import { InnovationFlowIcon } from '../../InnovationFlow/InnovationFlowIcon/InnovationFlowIcon';
import { PostIcon } from '../../post/icon/PostIcon';
import { WhiteboardIcon } from '../../whiteboard/icon/WhiteboardIcon';
import InnovationPackIcon from '../InnovationPackIcon';
import OneLineMarkdown from '../../../../core/ui/markdown/OneLineMarkdown';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';

export interface InnovationPackCardProps {
  profile: {
    displayName: string;
    description?: string;
    url: string;
  };
  calloutTemplatesCount?: number;
  communityGuidelinesTemplatesCount?: number;
  innovationFlowTemplatesCount?: number;
  postTemplatesCount?: number;
  whiteboardTemplatesCount?: number;
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
  calloutTemplatesCount,
  communityGuidelinesTemplatesCount,
  innovationFlowTemplatesCount,
  postTemplatesCount,
  whiteboardTemplatesCount,
}: InnovationPackCardProps) => {
  const { t } = useTranslation();
  return (
    <BadgeCardView
      visual={<RoundedIcon size="medium" component={InnovationPackIcon} />}
      component={RouterLink}
      to={url ?? ''}
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexDirection="column">
          <CardTitle>{displayName}</CardTitle>
          <OneLineMarkdown>{description ?? ''}</OneLineMarkdown>
        </Box>
      </Box>
      <Box display="flex" gap={gutters(0.5)} height={gutters(2)} alignItems="center" justifyContent="start">
        {!!calloutTemplatesCount && (
          <CardFooterCountWithBadge
            iconComponent={DesignServicesIcon}
            tooltip={t('common.enums.templateTypes.CollaborationToolTemplate_plural')}
          >
            <Caption>{calloutTemplatesCount}</Caption>
          </CardFooterCountWithBadge>
        )}
        {!!whiteboardTemplatesCount && (
          <CardFooterCountWithBadge
            iconComponent={WhiteboardIcon}
            tooltip={t('common.enums.templateTypes.WhiteboardTemplate_plural')}
          >
            <Caption>{whiteboardTemplatesCount}</Caption>
          </CardFooterCountWithBadge>
        )}
        {!!communityGuidelinesTemplatesCount && (
          <CardFooterCountWithBadge
            iconComponent={CommunityGuidelinesIcon}
            tooltip={t('common.enums.templateTypes.CommunityGuidelinesTemplate_plural')}
          >
            <Caption>{communityGuidelinesTemplatesCount}</Caption>
          </CardFooterCountWithBadge>
        )}
        {!!postTemplatesCount && (
          <CardFooterCountWithBadge
            iconComponent={PostIcon}
            tooltip={t('common.enums.templateTypes.PostTemplate_plural')}
          >
            <Caption>{postTemplatesCount}</Caption>
          </CardFooterCountWithBadge>
        )}
        {!!innovationFlowTemplatesCount && (
          <CardFooterCountWithBadge
            tooltip={t('common.enums.templateTypes.InnovationFlowTemplate_plural')}
            icon={
              // TODO Try to redraw InnovationFlowIcon in the same way as MUI icons are done
              <Box
                width={theme => theme.spacing(1.5)}
                sx={{ svg: { width: '100%' } }}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <InnovationFlowIcon />
              </Box>
            }
          >
            <Caption>{innovationFlowTemplatesCount}</Caption>
          </CardFooterCountWithBadge>
        )}
      </Box>
    </BadgeCardView>
  );
};

export default InnovationPackCardHorizontal;
