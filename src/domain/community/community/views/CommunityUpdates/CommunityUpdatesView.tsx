import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  alpha,
  Backdrop,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  Divider,
  GridLegacy,
  type GridLegacyProps,
  IconButton,
  Link,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import { Form, Formik } from 'formik';
import { orderBy } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import type { Message } from '@/core/apollo/generated/graphql-schema';
import SaveButton from '@/core/ui/actions/SaveButton';
import Avatar from '@/core/ui/avatar/Avatar';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownFieldLazy';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import type { AuthorModel } from '@/domain/community/user/models/AuthorModel';
import { FontDownloadIcon } from './icons/FontDownloadIcon';
import { FontDownloadOffIcon } from './icons/FontDownloadOffIcon';
import { useCommunityUpdatesViewState } from './useCommunityUpdatesViewState';

export interface CommunityUpdatesViewProps {
  entities: {
    messages: Message[];
    authors: AuthorModel[];
  };
  state: {
    loadingMessages: boolean;
    submittingMessage: boolean;
    removingMessage: boolean;
  };
  actions?: {
    onSubmit?: (message: string) => Promise<Message | undefined>;
    onRemove?: (messageId: string) => Promise<string | undefined>;
  };
  options?: {
    canEdit?: boolean;
    canCopy?: boolean;
    canRemove?: boolean;
    hideHeaders?: boolean;
    itemsPerRow?: number;
    disableElevation?: boolean;
    disableCollapse?: boolean;
  };
}

const expandStyles = theme => ({
  transform: 'rotate(0deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
});

export const CommunityUpdatesView = ({ entities, actions, state, options }: CommunityUpdatesViewProps) => {
  const { t } = useTranslation();
  const { messages, authors } = entities;
  const { loadingMessages, removingMessage } = state;
  const { canEdit, itemsPerRow, hideHeaders, canCopy, canRemove, disableCollapse, disableElevation } = options || {};
  const orderedMessages = orderBy(messages, x => x.timestamp, ['desc']);
  const initialValues = {
    'community-update': '',
  };
  const validationSchema = yup.object().shape({
    'community-update': MarkdownValidator(MARKDOWN_TEXT_LENGTH)
      .trim()
      .required(t('components.communityUpdates.msg-not-empty')),
  });
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [reviewedMessageId, setReviewedMessage] = useState<string | null>(null);
  const [reviewedMessageSourceIds, setReviewedMessageSourceIds] = useState<string[]>([]);

  const { stubMessageId, setStubMessageId, removedMessageId, setRemovedMessageId, memberMap, handleCopy } =
    useCommunityUpdatesViewState(orderedMessages, authors);

  const displayCardActions = canCopy || canRemove || !disableCollapse;
  const lastItemIndex = orderedMessages.length - 1;

  return (
    <>
      {canEdit && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            const onSubmit = actions?.onSubmit;
            if (onSubmit) {
              const message = await onSubmit(values['community-update']).finally(() => setSubmitting(false));
              setStubMessageId(message?.id || null);
              if (message?.id) {
                resetForm({
                  values: initialValues,
                });
              }
            }
          }}
        >
          {({ isValid, handleSubmit, isSubmitting }) => {
            return (
              <Form noValidate={true} onSubmit={handleSubmit}>
                <GridLegacy container={true} spacing={2}>
                  <GridLegacy item={true} xs={12}>
                    <FormikMarkdownField
                      name="community-update"
                      rows={30}
                      title={t('components.communityUpdates.title')}
                      required={true}
                      maxLength={MARKDOWN_TEXT_LENGTH}
                    />
                  </GridLegacy>
                  <GridLegacy container={true} item={true} xs={12} justifyContent="flex-end">
                    <SaveButton
                      type="submit"
                      disabled={!isValid}
                      loading={isSubmitting || removingMessage}
                      startIcon={<PlayArrowIcon />}
                    >
                      {t('components.communityUpdates.actions.add.buttonTitle')}
                    </SaveButton>
                  </GridLegacy>
                </GridLegacy>
              </Form>
            );
          }}
        </Formik>
      )}
      {!hideHeaders && orderedMessages.length > 0 && (
        <GridLegacy container={true} spacing={2}>
          <GridLegacy item={true} xs={12}>
            <Typography variant="h4" sx={{ marginBottom: 2 }}>
              {t('components.communityUpdates.updatesTitle')}
            </Typography>
          </GridLegacy>
        </GridLegacy>
      )}
      <GridLegacy container={true} spacing={2}>
        {stubMessageId && (
          <GridLegacy
            key={stubMessageId}
            item={true}
            xs={12}
            lg={(12 / (itemsPerRow || 2)) as keyof GridLegacyProps['lg']}
          >
            <Card elevation={2}>
              <CardHeader title={<Skeleton />} subheader={<Skeleton />} />
              <CardContent sx={{ position: 'relative' }}>
                <Skeleton height={40} />
              </CardContent>
              <CardActions disableSpacing={true}>
                <IconButton disabled={true} sx={theme => expandStyles(theme)} size="large">
                  <ExpandMoreIcon />
                </IconButton>
              </CardActions>
            </Card>
          </GridLegacy>
        )}
        {orderedMessages.length === 0 && !stubMessageId && !loadingMessages && (
          <GridLegacy item={true}>
            <Typography align={'center'} variant={'subtitle1'}>
              {t('common.no-updates')}
            </Typography>
          </GridLegacy>
        )}
        {orderedMessages.map((m, i) => {
          const expanded = reviewedMessageId === m.id;
          const reviewed = reviewedMessageSourceIds.indexOf(m.id) !== -1;
          const removed = removedMessageId === m.id && state.removingMessage;
          const member = m.sender?.id ? memberMap[m.sender.id] : undefined;
          return (
            <GridLegacy key={m.id} item={true} xs={12} lg={(12 / (itemsPerRow || 2)) as keyof GridLegacyProps['lg']}>
              <Card elevation={disableElevation ? 0 : 2} style={{ position: 'relative' }}>
                <Backdrop open={removed} style={{ position: 'absolute', zIndex: 1 }} />
                <CardHeader
                  avatar={
                    member && (
                      <Link key={member.id} href={member.url}>
                        <Avatar
                          src={member.avatarUrl}
                          ariaLabel="User avatar"
                          alt={
                            member.displayName
                              ? t('common.avatar-of', { user: member.displayName })
                              : t('common.avatar')
                          }
                        >
                          {member.displayName?.[0]}
                        </Avatar>
                      </Link>
                    )
                  }
                  title={member?.displayName || m.sender?.profile?.displayName}
                  subheader={new Date(m.timestamp).toLocaleString()}
                  action={
                    canEdit ? (
                      <Tooltip title={reviewed ? 'View source text' : 'View markdown'} placement="left">
                        <IconButton
                          onClick={() => {
                            setReviewedMessageSourceIds(ids =>
                              reviewed ? ids.filter(id => id !== m.id) : [...ids, m.id]
                            );
                          }}
                          size="large"
                        >
                          {reviewed ? <FontDownloadOffIcon /> : <FontDownloadIcon />}
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <span />
                    )
                  }
                />
                <CardContent sx={{ position: 'relative' }}>
                  <Collapse in={expanded || disableCollapse} timeout="auto" collapsedSize={40}>
                    <Box>
                      {!reviewed && <WrapperMarkdown>{m.message}</WrapperMarkdown>}
                      {reviewed && (
                        <Typography component="pre" style={{ whiteSpace: 'pre-line' }}>
                          {m.message}
                        </Typography>
                      )}
                    </Box>
                    {!(expanded || disableCollapse) && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          width: '100%',
                          height: '100%',
                          background: theme =>
                            `linear-gradient(to top, ${alpha(theme.palette.background.paper, 1)} 20%,  ${alpha(
                              theme.palette.background.paper,
                              0
                            )} 80%)`,
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </Collapse>
                </CardContent>
                {displayCardActions && (
                  <CardActions disableSpacing={true}>
                    {canCopy && (
                      <Tooltip title="Copy content to clipboard" placement="right">
                        <IconButton onClick={() => handleCopy(m.message)} size="large" aria-label="copy">
                          <FileCopyIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canRemove && (
                      <Tooltip title="Remove community update" placement="right">
                        <IconButton
                          onClick={() => {
                            setRemovedMessageId(m.id);
                            setShowConfirmationDialog(true);
                          }}
                          size="large"
                          aria-label={t('buttons.remove')}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {!disableCollapse && (
                      <Tooltip title={expanded ? 'View entire content' : 'Minimize'} placement="left">
                        <IconButton
                          sx={theme => ({
                            ...expandStyles(theme),
                            ...(expanded ? { transform: 'rotate(180deg)' } : {}),
                          })}
                          onClick={() => setReviewedMessage(x => (x === m.id ? null : m.id))}
                          aria-expanded={expanded}
                          aria-label={t('common.show-more')}
                          size="large"
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CardActions>
                )}
              </Card>
              {disableElevation && i !== lastItemIndex && <Divider />}
            </GridLegacy>
          );
        })}
        {loadingMessages && (
          <GridLegacy container={true} item={true} xs={12} justifyContent="center">
            <CircularProgress />
          </GridLegacy>
        )}
        <ConfirmationDialog
          options={{ show: showConfirmationDialog }}
          entities={{
            titleId: 'components.communityUpdates.actions.remove.confirmationTitle',
            contentId: 'components.communityUpdates.actions.remove.confirmationContent',
            confirmButtonTextId: 'components.communityUpdates.actions.remove.confirmationButtonTitle',
          }}
          actions={{
            onCancel: () => setShowConfirmationDialog(false),
            onConfirm: () => {
              setShowConfirmationDialog(false);
              if (actions?.onRemove && removedMessageId) {
                actions?.onRemove(removedMessageId);
              }
            },
          }}
        />
      </GridLegacy>
    </>
  );
};
