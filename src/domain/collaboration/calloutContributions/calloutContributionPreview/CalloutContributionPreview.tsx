import { useCalloutContributionQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeaderCardLike from '@/core/ui/content/PageContentBlockHeaderCardLike';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { formatDateTime } from '@/core/utils/time/utils';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconButton, Skeleton, Tooltip, useTheme } from '@mui/material';
import { contributionIcons } from '../../callout/icons/calloutIcons';
import { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';
import useNavigate from '@/core/routing/useNavigate';
import { useState } from 'react';
import CalloutContributionModel from '../CalloutContributionModel';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import { useTranslation } from 'react-i18next';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';
import { CalloutContributionPreviewDialogProps } from '../interfaces/CalloutContributionPreviewDialogProps';
import { useColumns } from '@/core/ui/grid/GridContext';

interface CalloutContributionPreviewProps {
  callout: CalloutDetailsModelExtended;
  contributionId: string;
  actions?: (contribution: CalloutContributionModel) => React.ReactNode;
  previewComponent: React.ComponentType<CalloutContributionPreviewComponentProps>;
  dialogComponent: React.ComponentType<CalloutContributionPreviewDialogProps>;
  onCalloutUpdate?: () => Promise<unknown>;
}

const CalloutContributionPreview = ({
  callout,
  contributionId,
  actions: renderExtraActions,
  previewComponent: PreviewComponent,
  dialogComponent: DialogComponent,
  onCalloutUpdate,
}: CalloutContributionPreviewProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const columns = useColumns();
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);

  const { allowedTypes } = callout.settings.contribution;
  const { data, loading } = useCalloutContributionQuery({
    variables: {
      contributionId,
      includeLink: allowedTypes.includes(CalloutContributionType.Link),
      includePost: allowedTypes.includes(CalloutContributionType.Post),
      includeWhiteboard: allowedTypes.includes(CalloutContributionType.Whiteboard),
    },
  });
  const contribution = data?.lookup.contribution;

  const contributionType = contribution?.post
    ? CalloutContributionType.Post
    : contribution?.link
      ? CalloutContributionType.Link
      : contribution?.whiteboard
        ? CalloutContributionType.Whiteboard
        : undefined;
  const Icon = contributionType ? contributionIcons[contributionType] : undefined;

  const displayName = loading ? (
    <Skeleton variant="text" width={gutters(12)(theme)} />
  ) : (
    (contributionType === CalloutContributionType.Post && contribution?.post?.profile.displayName) ||
    (contributionType === CalloutContributionType.Whiteboard && contribution?.whiteboard?.profile.displayName)
  );

  const author =
    (contributionType === CalloutContributionType.Post && contribution?.post?.createdBy?.profile.displayName) ||
    (contributionType === CalloutContributionType.Whiteboard &&
      contribution?.whiteboard?.createdBy?.profile.displayName);

  const createdDate =
    (contributionType === CalloutContributionType.Post && contribution?.post?.createdDate) ||
    (contributionType === CalloutContributionType.Whiteboard && contribution?.whiteboard?.createdDate);
  const formattedCreatedDate = createdDate && formatDateTime(createdDate);
  const formattedElapsedTime = createdDate && formatTimeElapsed(createdDate, t, columns > 6 ? 'long' : 'short');

  const contributionUrl =
    (contributionType === CalloutContributionType.Post && contribution?.post?.profile.url) ||
    (contributionType === CalloutContributionType.Whiteboard && contribution?.whiteboard?.profile.url);

  const handleContributionDeleted = (deletedContributionId: string) => {
    if (contributionId === deletedContributionId) {
      // Deleted the contribution currently on screen, navigate back to the callout
      navigate(callout.framing.profile.url);
    }
    onCalloutUpdate?.();
  };

  const calloutContributionTypeToShareDialogKey = (
    type: CalloutContributionType
  ): 'post' | 'whiteboard' | 'memo' | 'link' => {
    switch (type) {
      case CalloutContributionType.Post:
        return 'post';
      case CalloutContributionType.Whiteboard:
        return 'whiteboard';
      case CalloutContributionType.Link:
        return 'link';
      case CalloutContributionType.Memo:
        return 'memo';
    }
  };

  // Maybe we need to check if we can update the post/whiteboard/memo... inside?
  const canUpdateContribution =
    contribution?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

  return (
    <Gutters>
      <PageContentBlock>
        <PageContentBlockHeaderCardLike
          icon={Icon}
          title={displayName}
          subtitle={author}
          actions={
            <>
              <Tooltip title={formattedCreatedDate} arrow>
                <Caption whiteSpace="nowrap">{formattedElapsedTime}</Caption>
              </Tooltip>
              {canUpdateContribution && (
                <IconButton
                  onClick={() => setContributionDialogOpen(true)}
                  title={t('buttons.edit')}
                  aria-label={t('buttons.edit')}
                  color="primary"
                  size="small"
                >
                  <EditOutlinedIcon />
                </IconButton>
              )}

              {renderExtraActions && contribution && renderExtraActions(contribution)}
              {contributionUrl && (
                <ShareButton
                  url={contributionUrl}
                  entityTypeName={calloutContributionTypeToShareDialogKey(contributionType)}
                />
              )}
              <IconButton onClick={() => navigate(callout.framing.profile.url)} size="small">
                <CloseOutlinedIcon />
              </IconButton>
            </>
          }
        />
        <PreviewComponent
          callout={callout}
          contribution={contribution}
          loading={loading}
          onOpenContribution={() => setContributionDialogOpen(true)}
        />
        <DialogComponent
          calloutsSetId={callout.calloutsSetId}
          calloutId={callout.id}
          contribution={contribution}
          open={contributionDialogOpen}
          onClose={() => setContributionDialogOpen(false)}
          onCalloutUpdate={onCalloutUpdate}
          onContributionDeleted={handleContributionDeleted}
        />
      </PageContentBlock>
    </Gutters>
  );
};

export default CalloutContributionPreview;
