import React, { ReactNode } from 'react';
import ContributeCard, { ContributeCardProps } from '../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardDescriptionWithTags from '../../../../core/ui/card/CardDescriptionWithTags';
import CardFooter from '../../../../core/ui/card/CardFooter';
import InnovationPackIcon from '../InnovationPackIcon';
import CardFooterBadge from '../../../../core/ui/card/CardFooterBadge';
import { Box } from '@mui/material';
import { WhiteboardIcon } from '../../whiteboard/icon/WhiteboardIcon';
import { PostIcon } from '../../post/icon/PostIcon';
import { InnovationFlowIcon } from '../../../platform/admin/templates/InnovationTemplates/InnovationFlow/InnovationFlowIcon';
import CardFooterCountWithBadge from '../../../../core/ui/card/CardFooterCountWithBadge';
import { gutters } from '../../../../core/ui/grid/utils';

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
  innovationPackUri,
  ...props
}: InnovationPackCardProps) => {
  return (
    <ContributeCard {...props} to={innovationPackUri}>
      <CardHeader title={displayName} iconComponent={InnovationPackIcon} />
      <CardDetails>
        <CardDescriptionWithTags tags={tags}>{description}</CardDescriptionWithTags>
      </CardDetails>
      <CardFooter flexDirection="column" alignItems="stretch" height="auto">
        <Box display="flex" gap={gutters()} height={gutters(2)} alignItems="center" justifyContent="end">
          <CardFooterCountWithBadge iconComponent={WhiteboardIcon}>{whiteboardTemplatesCount}</CardFooterCountWithBadge>
          <CardFooterCountWithBadge iconComponent={PostIcon}>{postTemplatesCount}</CardFooterCountWithBadge>
          <CardFooterCountWithBadge
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
        </Box>
        <CardFooterBadge avatarUri={providerAvatarUri} avatarDisplayName={providerDisplayName}>
          {providerDisplayName}
        </CardFooterBadge>
      </CardFooter>
    </ContributeCard>
  );
};

export default InnovationPackCard;
