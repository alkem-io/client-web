import {
  Backdrop,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  GridProps,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import clsx from 'clsx';
import { Form, Formik } from 'formik';
import { keyBy } from 'lodash';
import orderBy from 'lodash/orderBy';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import ConfirmationDialog from '../../../../../core/ui/dialogs/ConfirmationDialog';
import Avatar from '../../../../../core/ui/image/Avatar';
import SaveButton from '../../../../../core/ui/actions/SaveButton';
import { FontDownloadIcon } from './icons/FontDownloadIcon';
import { FontDownloadOffIcon } from './icons/FontDownloadOffIcon';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { Message } from '../../../../../core/apollo/generated/graphql-schema';
import { Author } from '../../../../shared/components/AuthorAvatar/models/author';
import { MARKDOWN_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import hexToRGBA from '../../../../../core/utils/hexToRGBA';
import MarkdownValidator from '../../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import UserPopUp from '../../../user/userPopUp/UserPopUp';

export interface CommunityUpdatesViewProps {
  entities: {
    messages: Message[];
    authors: Author[];
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

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
  },
  rootFade: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(to top, ${hexToRGBA(theme.palette.background.paper, 1)} 20%,  ${hexToRGBA(
      theme.palette.background.paper,
      0
    )} 80%)`,
    pointerEvents: 'none',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
}));

export const CommunityUpdatesView: FC<CommunityUpdatesViewProps> = ({ entities, actions, state, options }) => {
  const styles = useStyles();
  const notify = useNotification();
  const { t } = useTranslation();
  // entities
  const { messages, authors } = entities;
  const { loadingMessages, removingMessage } = state;
  const { canEdit, itemsPerRow, hideHeaders, canCopy, canRemove, disableCollapse, disableElevation } = options || {};
  const orderedMessages = useMemo(() => orderBy(messages, x => x.timestamp, ['desc']), [messages]);
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
  const [stubMessageId, setStubMessageId] = useState<string | null>(null);
  const [removedMessageId, setRemovedMessageId] = useState<string | null>(null);
  const [reviewedMessageSourceIds, setReviewedMessageSourceIds] = useState<string[]>([]);
  const memberMap = useMemo(() => keyBy(authors, m => m.id), [authors]);

  const displayCardActions = canCopy || canRemove || !disableCollapse;
  const lastItemIndex = orderedMessages.length - 1;

  //effects
  useEffect(() => {
    setStubMessageId(id => (orderedMessages.find(m => m.id === id) ? null : id));
  }, [setStubMessageId, orderedMessages]);

  useEffect(() => {
    setRemovedMessageId(id => (orderedMessages.find(m => m.id === id) ? id : null));
  }, [setRemovedMessageId, orderedMessages]);

  return (
    <>
      {canEdit && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
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
              <Form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormikMarkdownField
                      name="community-update"
                      rows={30}
                      title={t('components.communityUpdates.title')}
                      required
                      maxLength={MARKDOWN_TEXT_LENGTH}
                    />
                  </Grid>
                  <Grid container item xs={12} justifyContent="flex-end">
                    <SaveButton
                      type="submit"
                      disabled={!isValid}
                      loading={isSubmitting || removingMessage}
                      startIcon={<PlayArrowIcon />}
                    >
                      {t('components.communityUpdates.actions.add.buttonTitle')}
                    </SaveButton>
                  </Grid>
                </Grid>
              </Form>
            );
          }}
        </Formik>
      )}
      {!hideHeaders && orderedMessages.length > 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ marginBottom: 2 }}>
              {t('components.communityUpdates.updatesTitle')}
            </Typography>
          </Grid>
        </Grid>
      )}
      <Grid container spacing={2}>
        {stubMessageId && (
          <Grid key={stubMessageId} item xs={12} lg={(12 / (itemsPerRow || 2)) as keyof GridProps['lg']}>
            <Card elevation={2}>
              <CardHeader title={<Skeleton />} subheader={<Skeleton />} />
              <CardContent className={styles.root}>
                <Skeleton height={40} />
              </CardContent>
              <CardActions disableSpacing>
                <IconButton disabled className={clsx(styles.expand)} size="large">
                  <ExpandMoreIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        )}
        {orderedMessages.length === 0 && !stubMessageId && (
          <Grid item>
            <Typography align={'center'} variant={'subtitle1'}>
              {t('common.no-updates')}
            </Typography>
          </Grid>
        )}
        {orderedMessages.map((m, i) => {
          const expanded = reviewedMessageId === m.id;
          const reviewed = reviewedMessageSourceIds.indexOf(m.id) !== -1;
          const removed = removedMessageId === m.id && state.removingMessage;
          const member = m.sender?.id ? memberMap[m.sender.id] : undefined;
          return (
            <Grid key={m.id} item xs={12} lg={(12 / (itemsPerRow || 2)) as keyof GridProps['lg']}>
              <Card elevation={disableElevation ? 0 : 2} style={{ position: 'relative' }}>
                <Backdrop open={removed} style={{ position: 'absolute', zIndex: 1 }} />
                <CardHeader
                  avatar={
                    member && (
                      <Avatar
                        key={member.id}
                        src={member.avatarUrl}
                        name={member.displayName}
                        renderPopup={({ open, onHide }) => open && <UserPopUp id={member.id} onHide={onHide} />}
                      />
                    )
                  }
                  title={member?.displayName || m.sender}
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
                <CardContent className={styles.root}>
                  <Collapse in={expanded || disableCollapse} timeout="auto" collapsedSize={40}>
                    <Box>
                      {!reviewed && <WrapperMarkdown>{m.message}</WrapperMarkdown>}
                      {reviewed && (
                        <Typography component="pre" style={{ whiteSpace: 'pre-line' }}>
                          {m.message}
                        </Typography>
                      )}
                    </Box>
                    {!(expanded || disableCollapse) && <Box className={styles.rootFade} />}
                  </Collapse>
                </CardContent>
                {displayCardActions && (
                  <CardActions disableSpacing>
                    {canCopy && (
                      <CopyToClipboard text={m.message} onCopy={() => notify('Post copied to clipboard', 'info')}>
                        <Tooltip title="Copy content to clipboard" placement="right">
                          <IconButton size="large">
                            <FileCopyIcon />
                          </IconButton>
                        </Tooltip>
                      </CopyToClipboard>
                    )}
                    {canRemove && (
                      <Tooltip title="Remove community update" placement="right">
                        <IconButton
                          onClick={() => {
                            setRemovedMessageId(m.id);
                            setShowConfirmationDialog(true);
                          }}
                          size="large"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {!disableCollapse && (
                      <Tooltip title={expanded ? 'View entire content' : 'Minimize'} placement="left">
                        <IconButton
                          className={clsx(styles.expand, {
                            [styles.expandOpen]: expanded,
                          })}
                          onClick={() => setReviewedMessage(x => (x === m.id ? null : m.id))}
                          aria-expanded={expanded}
                          aria-label="show more"
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
            </Grid>
          );
        })}
        {loadingMessages && (
          <Grid container item xs={12} justifyContent="center">
            <CircularProgress />
          </Grid>
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
      </Grid>
    </>
  );
};
