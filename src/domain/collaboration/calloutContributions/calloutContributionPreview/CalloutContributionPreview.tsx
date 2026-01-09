import { useCalloutContributionQuery } from '@/core/apollo/generated/apollo-hooks';
import { CalloutContributionType, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeaderCardLike from '@/core/ui/content/PageContentBlockHeaderCardLike';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { formatDateTime } from '@/core/utils/time/utils';
import { Skeleton, Tooltip, useTheme } from '@mui/material';
import { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';
import useNavigate from '@/core/routing/useNavigate';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';
import { CalloutContributionPreviewDialogProps } from '../interfaces/CalloutContributionPreviewDialogProps';
import { useColumns } from '@/core/ui/grid/GridContext';
import { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';
import Avatar from '@/core/ui/avatar/Avatar';
import ContributorTooltip from '@/domain/community/contributor/ContributorTooltip/ContributorTooltip';

interface CalloutContributionPreviewProps {
  callout: CalloutDetailsModelExtended;
  contributionId: string;
  previewComponent: React.ComponentType<CalloutContributionPreviewComponentProps>;
  dialogComponent: React.ComponentType<CalloutContributionPreviewDialogProps>;
  calloutRestrictions?: CalloutRestrictions;
  onCalloutUpdate?: () => Promise<unknown>;
}

const CalloutContributionPreview = ({
  callout,
  contributionId,
  previewComponent: PreviewComponent,
  dialogComponent: DialogComponent,
  calloutRestrictions,
  onCalloutUpdate,
}: CalloutContributionPreviewProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const columns = useColumns();
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const extraActionsPortalRef = useRef<HTMLDivElement>(null);

  const { allowedTypes } = callout.settings.contribution;
  const { data, loading } = useCalloutContributionQuery({
    variables: {
      contributionId,
      includeLink: allowedTypes.includes(CalloutContributionType.Link),
      includePost: allowedTypes.includes(CalloutContributionType.Post),
      includeWhiteboard: allowedTypes.includes(CalloutContributionType.Whiteboard),
      includeMemo: allowedTypes.includes(CalloutContributionType.Memo),
    },
    skip: !contributionId,
  });
  const contribution = data?.lookup.contribution;

  const contributionType = contribution?.post
    ? CalloutContributionType.Post
    : contribution?.link
      ? CalloutContributionType.Link
      : contribution?.whiteboard
        ? CalloutContributionType.Whiteboard
        : contribution?.memo
          ? CalloutContributionType.Memo
          : undefined;

  const displayName = loading ? (
    <Skeleton variant="text" width={gutters(12)(theme)} />
  ) : (
    (contributionType === CalloutContributionType.Post && contribution?.post?.profile.displayName) ||
    (contributionType === CalloutContributionType.Whiteboard && contribution?.whiteboard?.profile.displayName) ||
    (contributionType === CalloutContributionType.Memo && contribution?.memo?.profile.displayName)
  );

  const author =
    (contributionType === CalloutContributionType.Post && contribution?.post?.createdBy) ||
    (contributionType === CalloutContributionType.Whiteboard && contribution?.whiteboard?.createdBy) ||
    (contributionType === CalloutContributionType.Memo && contribution?.memo?.createdBy) ||
    undefined;

  const authorAvatar = author?.profile.avatar?.uri ? (
    <ContributorTooltip contributorId={author.id} contributorType={RoleSetContributorType.User}>
      <Avatar size="small" src={author.profile.avatar.uri} alt={author.profile.avatar.alternativeText} />
    </ContributorTooltip>
  ) : undefined;

  const createdDate =
    (contributionType === CalloutContributionType.Post && contribution?.post?.createdDate) ||
    (contributionType === CalloutContributionType.Whiteboard && contribution?.whiteboard?.createdDate) ||
    (contributionType === CalloutContributionType.Memo && contribution?.memo?.createdDate);
  const formattedCreatedDate = createdDate && formatDateTime(createdDate);
  const formattedElapsedTime = createdDate && formatTimeElapsed(createdDate, t, columns > 6 ? 'long' : 'short');

  const handleContributionDeleted = (deletedContributionId: string) => {
    if (contributionId === deletedContributionId) {
      // Deleted the contribution currently on screen, navigate back to the callout
      navigate(callout.framing.profile.url);
    }
    onCalloutUpdate?.();
  };

  return (
    <PageContentBlock disablePadding disableGap>
      <PageContentBlockHeaderCardLike
        avatar={authorAvatar}
        title={displayName}
        subtitle={author?.profile.displayName}
        selected
        actions={
          <>
            <Tooltip title={formattedCreatedDate} arrow>
              <Caption whiteSpace="nowrap" color="textPrimary">
                {formattedElapsedTime}
              </Caption>
            </Tooltip>
          </>
        }
      />
      <PreviewComponent
        callout={callout}
        contribution={contribution}
        loading={loading}
        onOpenContribution={() => setContributionDialogOpen(true)}
        extraActionsPortalRef={extraActionsPortalRef}
      />
      <DialogComponent
        calloutsSetId={callout.calloutsSetId}
        calloutId={callout.id}
        contribution={contribution}
        open={contributionDialogOpen}
        onClose={() => setContributionDialogOpen(false)}
        onCalloutUpdate={onCalloutUpdate}
        onContributionDeleted={handleContributionDeleted}
        calloutRestrictions={calloutRestrictions}
      />
    </PageContentBlock>
  );
};

export default CalloutContributionPreview;
