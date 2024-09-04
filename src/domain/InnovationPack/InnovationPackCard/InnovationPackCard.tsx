import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import ContributeCard, { ContributeCardProps } from '../../../core/ui/card/ContributeCard';
import CardHeader from '../../../core/ui/card/CardHeader';
import CardDetails from '../../../core/ui/card/CardDetails';
import CardDescriptionWithTags from '../../../core/ui/card/CardDescriptionWithTags';
import CardFooter from '../../../core/ui/card/CardFooter';
import InnovationPackIcon from '../InnovationPackIcon';
import CardFooterBadge from '../../../core/ui/card/CardFooterBadge';
import { Box } from '@mui/material';
import { WhiteboardIcon } from '../../collaboration/whiteboard/icon/WhiteboardIcon';
import { PostIcon } from '../../collaboration/post/icon/PostIcon';
import { InnovationFlowIcon } from '../../collaboration/InnovationFlow/InnovationFlowIcon/InnovationFlowIcon';
import CardFooterCountWithBadge from '../../../core/ui/card/CardFooterCountWithBadge';
import { gutters } from '../../../core/ui/grid/utils';
import { CommunityGuidelinesIcon } from '../../community/communityGuidelines/icon/CommunityGuidelinesIcon';

export interface InnovationPackCardProps extends ContributeCardProps {
  displayName: string;
  description: string | undefined;
  tags: string[] | undefined;
  providerAvatarUri: string | undefined;
  providerDisplayName: string | undefined;
  onClick?: () => void;
  whiteboardTemplatesCount?: ReactNode;
  postTemplatesCount: ReactNode;
  innovationFlowTemplatesCount: ReactNode;
  calloutTemplatesCount?: ReactNode;
  communityGuidelinesTemplatesCount?: ReactNode;
  innovationPackUri: string;
}

const InnovationPackCard = ({
  displayName,
  description,
  tags = [],
  providerDisplayName,
  providerAvatarUri,
  whiteboardTemplatesCount,
  postTemplatesCount,
  innovationFlowTemplatesCount,
  calloutTemplatesCount,
  communityGuidelinesTemplatesCount,
  innovationPackUri,
  ...props
}: InnovationPackCardProps) => {
  const { t } = useTranslation();
  return (
    <ContributeCard {...props} to={innovationPackUri}>
      <CardHeader title={displayName} iconComponent={InnovationPackIcon} />
      <CardDetails>
        <CardDescriptionWithTags tags={tags}>{description}</CardDescriptionWithTags>
      </CardDetails>
      <CardFooter flexDirection="column" alignItems="stretch" height="auto">
        <Box display="flex" gap={gutters(0.5)} height={gutters(2)} alignItems="center" justifyContent="end">
          {!!calloutTemplatesCount && (
            <CardFooterCountWithBadge
              iconComponent={DesignServicesIcon}
              tooltip={t('common.enums.templateTypes.Callout_plural')}
            >
              {calloutTemplatesCount}
            </CardFooterCountWithBadge>
          )}
          {!!whiteboardTemplatesCount && (
            <CardFooterCountWithBadge
              iconComponent={WhiteboardIcon}
              tooltip={t('common.enums.templateTypes.Whiteboard_plural')}
            >
              {whiteboardTemplatesCount}
            </CardFooterCountWithBadge>
          )}
          {!!communityGuidelinesTemplatesCount && (
            <CardFooterCountWithBadge
              iconComponent={CommunityGuidelinesIcon}
              tooltip={t('common.enums.templateTypes.CommunityGuidelines_plural')}
            >
              {communityGuidelinesTemplatesCount}
            </CardFooterCountWithBadge>
          )}
          {!!postTemplatesCount && (
            <CardFooterCountWithBadge iconComponent={PostIcon} tooltip={t('common.enums.templateTypes.Post_plural')}>
              {postTemplatesCount}
            </CardFooterCountWithBadge>
          )}
          {!!innovationFlowTemplatesCount && (
            <CardFooterCountWithBadge
              tooltip={t('common.enums.templateTypes.InnovationFlow_plural')}
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
              {innovationFlowTemplatesCount}
            </CardFooterCountWithBadge>
          )}
        </Box>
        <CardFooterBadge avatarUri={providerAvatarUri} avatarDisplayName={providerDisplayName}>
          {providerDisplayName}
        </CardFooterBadge>
      </CardFooter>
    </ContributeCard>
  );
};

export default InnovationPackCard;
