import DesignServicesIcon from '@mui/icons-material/DesignServices';
import { Box, Skeleton, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CardFooterCountWithBadge from '../../../core/ui/card/CardFooterCountWithBadge';
import { gutters } from '../../../core/ui/grid/utils';
import RouterLink from '../../../core/ui/link/RouterLink';
import BadgeCardView from '../../../core/ui/list/BadgeCardView';
import { Caption, CardTitle } from '../../../core/ui/typography';
import { CommunityGuidelinesIcon } from '../../community/communityGuidelines/icon/CommunityGuidelinesIcon';
import { InnovationFlowIcon } from '../../collaboration/InnovationFlow/InnovationFlowIcon/InnovationFlowIcon';
import { PostIcon } from '../../collaboration/post/icon/PostIcon';
import { WhiteboardIcon } from '../../collaboration/whiteboard/icon/WhiteboardIcon';
import InnovationPackIcon from '../InnovationPackIcon';
import RoundedIcon from '../../../core/ui/icon/RoundedIcon';
import ActionsMenu from '../../../core/ui/card/ActionsMenu';
import OneLineMarkdown from '../../../core/ui/markdown/OneLineMarkdown';
import { TemplateType } from '../../../core/apollo/generated/graphql-schema';

export interface InnovationPackCardHorizontalProps {
  profile: {
    displayName: string;
    description?: string;
    url: string;
  };
  templates?: {
    calloutTemplatesCount?: number;
    communityGuidelinesTemplatesCount?: number;
    innovationFlowTemplatesCount?: number;
    postTemplatesCount?: number;
    whiteboardTemplatesCount?: number;
  };
  actions?: React.ReactNode;
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
}: InnovationPackCardHorizontalProps) => {
  const { t } = useTranslation();

  const {
    calloutTemplatesCount,
    communityGuidelinesTemplatesCount,
    innovationFlowTemplatesCount,
    postTemplatesCount,
    whiteboardTemplatesCount,
  } = templates ?? {};

  const totalTemplatesCount =
    (calloutTemplatesCount ?? 0) +
    (communityGuidelinesTemplatesCount ?? 0) +
    (innovationFlowTemplatesCount ?? 0) +
    (postTemplatesCount ?? 0) +
    (whiteboardTemplatesCount ?? 0);

  return (
    <BadgeCardView
      visual={<RoundedIcon size="medium" component={InnovationPackIcon} />}
      component={RouterLink}
      to={url ?? ''}
      actions={actions && <ActionsMenu>{actions}</ActionsMenu>}
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexDirection="column">
          <CardTitle>{displayName}</CardTitle>
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
          {!!innovationFlowTemplatesCount && (
            <CardFooterCountWithBadge
              tooltip={t(`common.enums.templateType.${TemplateType.InnovationFlow}_plural`)}
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
          {/* {totalTemplatesCount === 0 && <Caption>{t('pages.admin.generic.sections.account.noTemplates')}</Caption>} */}
        </Box>
      )}
    </BadgeCardView>
  );
};

export default InnovationPackCardHorizontal;
