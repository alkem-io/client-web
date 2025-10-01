import { useCalloutContributionQuery } from '@/core/apollo/generated/apollo-hooks';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeaderCardLike from '@/core/ui/content/PageContentBlockHeaderCardLike';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { formatDateTime } from '@/core/utils/time/utils';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Skeleton, useTheme } from '@mui/material';
import { contributionIcons } from '../../callout/icons/calloutIcons';
import { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';
import useNavigate from '@/core/routing/useNavigate';
import { useState } from 'react';
import CalloutContributionModel from '../CalloutContributionModel';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import { useTranslation } from 'react-i18next';

/**
 * Properties that a Preview Contribution component must receive
 */
export interface CalloutContributionPreviewComponentProps {
  callout: CalloutDetailsModelExtended;
  contribution: CalloutContributionModel | undefined;
  onOpenContribution: () => void;
  loading?: boolean;
}
/**
 * Properties that a Preview Dialog component must receive
 */
export interface CalloutContributionPreviewDialogProps {
  calloutsSetId: string | undefined;
  calloutId: string | undefined;
  contribution: CalloutContributionModel | undefined;
  open: boolean;
  onClose: () => void;
}

interface CalloutContributionPreviewProps {
  callout: CalloutDetailsModelExtended;
  contributionId: string;
  actions?: (contribution: CalloutContributionModel) => React.ReactNode;
  previewComponent: React.ComponentType<CalloutContributionPreviewComponentProps>;
  dialogComponent: React.ComponentType<CalloutContributionPreviewDialogProps>;
}

const CalloutContributionPreview = ({
  callout,
  contributionId,
  actions: renderExtraActions,
  previewComponent: PreviewComponent,
  dialogComponent: DialogComponent,
}: CalloutContributionPreviewProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);

  const { data, loading } = useCalloutContributionQuery({
    variables: {
      contributionId,
      includeLink: callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Link),
      includePost: callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Post),
      includeWhiteboard: callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Whiteboard),
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

  const formattedCreatedDate =
    (contributionType === CalloutContributionType.Post &&
      contribution?.post?.createdDate &&
      formatDateTime(contribution.post.createdDate)) ||
    (contributionType === CalloutContributionType.Whiteboard &&
      contribution?.whiteboard?.createdDate &&
      formatDateTime(contribution.whiteboard.createdDate));

  const contributionUrl =
    (contributionType === CalloutContributionType.Post && contribution?.post?.profile.url) ||
    (contributionType === CalloutContributionType.Whiteboard && contribution?.whiteboard?.profile.url);
  return (
    <Gutters>
      <PageContentBlock>
        <PageContentBlockHeaderCardLike
          icon={Icon}
          title={displayName}
          subtitle={author}
          actions={
            <>
              <Caption>{formattedCreatedDate}</Caption>
              {/* TODO: Here the comments to the post */}
              <IconButton
                onClick={() => setContributionDialogOpen(true)}
                title={t('buttons.edit')}
                aria-label={t('buttons.edit')}
                color="primary"
                size="small"
              >
                <EditIcon />
              </IconButton>

              {renderExtraActions && contribution && renderExtraActions(contribution)}
              {contributionUrl && <ShareButton url={contributionUrl} entityTypeName={contributionType} />}
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
        />
      </PageContentBlock>
    </Gutters>
  );
};

export default CalloutContributionPreview;
