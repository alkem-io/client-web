import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, IconButton, Skeleton, Tooltip, useTheme } from '@mui/material';
import { type Ref, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutContributionQuery } from '@/core/apollo/generated/apollo-hooks';
import { ActorType, AuthorizationPrivilege, CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import Avatar from '@/core/ui/avatar/Avatar';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeaderCardLike from '@/core/ui/content/PageContentBlockHeaderCardLike';
import { useColumns } from '@/core/ui/grid/GridContext';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { formatDateTime } from '@/core/utils/time/utils';
import ContributorTooltip from '@/domain/community/contributor/ContributorTooltip/ContributorTooltip';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import type { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';
import type { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';
import type { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';
import type { CalloutContributionPreviewDialogProps } from '../interfaces/CalloutContributionPreviewDialogProps';

interface CalloutContributionPreviewProps {
  callout: CalloutDetailsModelExtended;
  contributionId: string;
  previewComponent: React.ComponentType<CalloutContributionPreviewComponentProps>;
  dialogComponent: React.ComponentType<CalloutContributionPreviewDialogProps>;
  openContributionDialogOnLoad?: boolean;
  calloutRestrictions?: CalloutRestrictions;
  onCalloutUpdate?: () => Promise<unknown>;
}

const CalloutContributionPreview = ({
  ref,
  callout,
  contributionId,
  previewComponent: PreviewComponent,
  dialogComponent: DialogComponent,
  openContributionDialogOnLoad = false,
  calloutRestrictions,
  onCalloutUpdate,
}: CalloutContributionPreviewProps & {
  ref?: Ref<HTMLDivElement>;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const columns = useColumns();
  const [contributionDialogOpen, setContributionDialogOpen] = useState(openContributionDialogOnLoad);
  const extraActionsPortalRef = useRef<HTMLDivElement>(null);

  const { allowedTypes } = callout.settings.contribution;
  const { data, loading } = useCalloutContributionQuery({
    variables: {
      contributionId,
      includeLink: allowedTypes.includes(CalloutContributionType.Link),
      includePost: allowedTypes.includes(CalloutContributionType.Post),
      includeWhiteboard: allowedTypes.includes(CalloutContributionType.Whiteboard),
      includeMemo: allowedTypes.includes(CalloutContributionType.Memo),
      includeCollaboraDocument: allowedTypes.includes(CalloutContributionType.CollaboraDocument),
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
          : contribution?.collaboraDocument
            ? CalloutContributionType.CollaboraDocument
            : undefined;

  const displayName = loading ? (
    <Skeleton variant="text" width={gutters(12)(theme)} />
  ) : (
    (contributionType === CalloutContributionType.Post && contribution?.post?.profile.displayName) ||
    (contributionType === CalloutContributionType.Whiteboard && contribution?.whiteboard?.profile.displayName) ||
    (contributionType === CalloutContributionType.Memo && contribution?.memo?.profile.displayName) ||
    (contributionType === CalloutContributionType.CollaboraDocument &&
      contribution?.collaboraDocument?.profile?.displayName)
  );

  const author =
    (contributionType === CalloutContributionType.Post && contribution?.post?.createdBy) ||
    (contributionType === CalloutContributionType.Whiteboard && contribution?.whiteboard?.createdBy) ||
    (contributionType === CalloutContributionType.Memo && contribution?.memo?.createdBy) ||
    (contributionType === CalloutContributionType.CollaboraDocument && contribution?.collaboraDocument?.createdBy) ||
    undefined;

  const authorAvatar = author?.profile?.avatar?.uri ? (
    <ContributorTooltip contributorId={author.id} contributorType={ActorType.User}>
      <Avatar size="small" src={author.profile.avatar.uri} alt={author.profile.avatar.alternativeText} />
    </ContributorTooltip>
  ) : undefined;

  const createdDate =
    (contributionType === CalloutContributionType.Post && contribution?.post?.createdDate) ||
    (contributionType === CalloutContributionType.Whiteboard && contribution?.whiteboard?.createdDate) ||
    (contributionType === CalloutContributionType.Memo && contribution?.memo?.createdDate) ||
    (contributionType === CalloutContributionType.CollaboraDocument && contribution?.collaboraDocument?.createdDate);
  const formattedCreatedDate = createdDate && formatDateTime(createdDate);
  const formattedElapsedTime = createdDate && formatTimeElapsed(createdDate, t, columns > 6 ? 'long' : 'short');

  const contributionUrl =
    (contributionType === CalloutContributionType.Post && contribution?.post?.profile.url) ||
    (contributionType === CalloutContributionType.Whiteboard && contribution?.whiteboard?.profile.url) ||
    (contributionType === CalloutContributionType.Memo && contribution?.memo?.profile.url) ||
    (contributionType === CalloutContributionType.CollaboraDocument && contribution?.collaboraDocument?.profile?.url);

  const handleContributionDeleted = (deletedContributionId: string) => {
    if (contributionId === deletedContributionId) {
      // Deleted the contribution currently on screen, navigate back to the callout
      navigate(callout.framing.profile.url);
    }
    onCalloutUpdate?.();
  };

  const calloutContributionTypeToShareDialogKey = (
    type: CalloutContributionType
  ): 'post' | 'whiteboard' | 'memo' | 'link' | 'collaboraDocument' => {
    switch (type) {
      case CalloutContributionType.Post:
        return 'post';
      case CalloutContributionType.Whiteboard:
        return 'whiteboard';
      case CalloutContributionType.Link:
        return 'link';
      case CalloutContributionType.Memo:
        return 'memo';
      case CalloutContributionType.CollaboraDocument:
        return 'collaboraDocument';
    }
  };

  const canUpdateContribution =
    contribution?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

  return (
    <PageContentBlock disablePadding={true} disableGap={true} ref={ref}>
      <PageContentBlockHeaderCardLike
        avatar={authorAvatar}
        title={displayName}
        subtitle={author?.profile?.displayName}
        selected={true}
        actions={
          <>
            <Tooltip title={formattedCreatedDate} arrow={true}>
              <Caption whiteSpace="nowrap" color="textPrimary">
                {formattedElapsedTime}
              </Caption>
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
            {/* `display: contents` avoids the box to occupy any space if it's empty */}
            <Box ref={extraActionsPortalRef} display="contents" />
            {contributionUrl && (
              <ShareButton
                url={contributionUrl}
                entityTypeName={calloutContributionTypeToShareDialogKey(contributionType)}
                resetDialogTheme={true}
              />
            )}
            <IconButton
              onClick={() => navigate(callout.framing.profile.url)}
              size="small"
              sx={{ color: theme => theme.palette.text.primary }}
              aria-label={t('buttons.close')}
            >
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
