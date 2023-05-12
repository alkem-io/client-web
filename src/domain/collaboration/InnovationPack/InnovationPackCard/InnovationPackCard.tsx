import React, { ReactNode } from 'react';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../core/ui/card/CardDescription';
import CardTags from '../../../../core/ui/card/CardTags';
import CardFooter from '../../../../core/ui/card/CardFooter';
import InnovationPackIcon from '../InnovationPackIcon';
import CardFooterBadge from '../../../../core/ui/card/CardFooterBadge';
import { Box } from '@mui/material';
import { CanvasIcon } from '../../canvas/icon/CanvasIcon';
import { AspectIcon } from '../../aspect/icon/AspectIcon';
import { InnovationFlowIcon } from '../../../platform/admin/templates/InnovationTemplates/InnovationFlow/InnovationFlowIcon';
import CardFooterCountWithBadge from '../../../../core/ui/card/CardFooterCountWithBadge';
import { gutters } from '../../../../core/ui/grid/utils';

export interface InnovationPackCardProps {
  displayName: string;
  description: string | undefined;
  tags: string[] | undefined;
  providerAvatarUri: string | undefined;
  providerDisplayName: string | undefined;
  onClick?: () => void;
  whiteboardTemplatesCount?: ReactNode;
  postTemplatesCount: ReactNode;
  innovationFlowTemplatesCount: ReactNode;
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
  ...props
}: InnovationPackCardProps) => {
  return (
    <ContributeCard {...props}>
      <CardHeader title={displayName} iconComponent={InnovationPackIcon} />
      <CardDetails>
        <CardDescription>{description ?? ''}</CardDescription>
        <CardTags tags={tags} paddingX={1.5} marginY={1} />
      </CardDetails>
      <CardFooter flexDirection="column" alignItems="stretch" height="auto">
        <Box display="flex" gap={gutters()} height={gutters(2)} alignItems="center" justifyContent="end">
          <CardFooterCountWithBadge iconComponent={CanvasIcon}>{whiteboardTemplatesCount}</CardFooterCountWithBadge>
          <CardFooterCountWithBadge iconComponent={AspectIcon}>{postTemplatesCount}</CardFooterCountWithBadge>
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
        <CardFooterBadge avatarUri={providerAvatarUri}>{providerDisplayName}</CardFooterBadge>
      </CardFooter>
    </ContributeCard>
  );
};

export default InnovationPackCard;
