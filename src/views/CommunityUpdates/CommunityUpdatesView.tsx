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
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { Skeleton } from '@material-ui/lab';
import MDEditor from '@uiw/react-md-editor';
import clsx from 'clsx';
import { Form, Formik } from 'formik';
import { keyBy } from 'lodash';
import orderBy from 'lodash/orderBy';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useMarkdownInputField } from '../../components/Admin/Common/useMarkdownInputField';
import ConfirmationDialog from '../../components/composite/dialogs/ConfirmationDialog';
import Avatar from '../../components/core/Avatar';
import Button from '../../components/core/Button';
import { FontDownloadIcon } from '../../components/icons/FontDownloadIcon';
import { FontDownloadOffIcon } from '../../components/icons/FontDownloadOffIcon';
import { useNotification } from '../../hooks';
import { Message, User } from '../../models/graphql-schema';

export interface CommunityUpdatesViewProps {
  entities: {
    messages: Message[];
    members: User[];
  };
  state: {
    loadingMessages: boolean;
    submittingMessage: boolean;
    removingMessage: boolean;
  };
  actions?: {
    onSubmit?: (value: string) => Promise<string | undefined>;
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
    background: 'linear-gradient(to top, rgba(255,255,255, 1) 20%, rgba(255,255,255, 0) 80%)',
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
  // styling
  const styles = useStyles();
  // components
  const getMarkdownInput = useMarkdownInputField();
  const notify = useNotification();
  const { t } = useTranslation();
  // entities
  const { messages, members } = entities;
  const { loadingMessages, removingMessage } = state;
  const { canEdit, itemsPerRow, hideHeaders, canCopy, canRemove, disableCollapse, disableElevation } = options || {};
  const orderedMessages = useMemo(() => orderBy(messages, x => x.timestamp, ['desc']), [messages]);
  const initialValues = {
    'community-update': '',
  };
  const validationSchema = yup.object().shape({
    'community-update': yup.string().required(t('components.communityUpdates.msg-not-empty')),
  });
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [reviewedMessageId, setReviewedMessage] = useState<string | null>(null);
  const [stubMessageId, setStubMessageId] = useState<string | null>(null);
  const [removedMessageId, setRemovedMessageId] = useState<string | null>(null);
  const [reviewedMessageSourceIds, setReviewedMessageSourceIds] = useState<string[]>([]);
  const memberMap = useMemo(() => keyBy(members, m => m.id), [members]);

  const displayCardActions = canCopy || canRemove || !disableCollapse;
  const lastItemIndex = orderedMessages.length - 1;

  //effects
  useEffect(() => {
    setStubMessageId(id => (orderedMessages.find(m => m.id === id) ? null : id));
  }, [setStubMessageId, orderedMessages]);

  useEffect(() => {
    setRemovedMessageId(id => (orderedMessages.find(m => m.id === id) ? id : null));
  }, [setRemovedMessageId, orderedMessages]);

  if (orderedMessages.length === 0) {
    return <Typography>{t('common.no-updates')}</Typography>;
  }

  return (
    <>
      {!hideHeaders && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">{t('components.communityUpdates.title')}</Typography>
          </Grid>
        </Grid>
      )}
      {canEdit && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            const onSubmit = actions?.onSubmit;
            if (onSubmit) {
              const messageId = await onSubmit(values['community-update']).finally(() => setSubmitting(false));
              setStubMessageId(messageId || null);
            }
            resetForm({
              values: initialValues,
            });
          }}
        >
          {({ isValid, handleSubmit, isSubmitting, dirty }) => {
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {getMarkdownInput({ name: 'community-update', rows: 30, label: '', required: true })}
                  </Grid>
                  <Grid container item xs={12} justifyContent="flex-end">
                    <Button
                      text={t('components.communityUpdates.actions.add.buttonTitle')}
                      type={'submit'}
                      disabled={isSubmitting || removingMessage || !isValid || !dirty}
                      startIcon={isSubmitting ? <CircularProgress size={24} /> : <PlayArrowIcon />}
                    />
                  </Grid>
                </Grid>
              </Form>
            );
          }}
        </Formik>
      )}
      {!hideHeaders && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">{t('components.communityUpdates.updatesTitle')}</Typography>
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
                <IconButton disabled className={clsx(styles.expand)}>
                  <ExpandMoreIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        )}
        {orderedMessages.map((m, i) => {
          const expanded = reviewedMessageId === m.id;
          const reviewed = reviewedMessageSourceIds.indexOf(m.id) !== -1;
          const removed = removedMessageId === m.id && state.removingMessage;
          const member = memberMap[m.sender];
          return (
            <Grid key={m.id} item xs={12} lg={(12 / (itemsPerRow || 2)) as keyof GridProps['lg']}>
              <Card elevation={disableElevation ? 0 : 2} style={{ position: 'relative' }}>
                <Backdrop open={removed} style={{ position: 'absolute', zIndex: 1 }} />
                <CardHeader
                  avatar={
                    member && (
                      <Avatar
                        key={member?.id}
                        src={member.profile?.avatar}
                        userId={member?.id}
                        name={member?.displayName}
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
                      {!reviewed && <MDEditor.Markdown source={m.message} />}
                      {reviewed && (
                        <Typography component="pre" style={{ whiteSpace: 'pre-line' }}>
                          {m.message}
                        </Typography>
                      )}
                    </Box>
                    {!(expanded || disableCollapse) && <Box className={styles.rootFade}></Box>}
                  </Collapse>
                </CardContent>
                {displayCardActions && (
                  <CardActions disableSpacing>
                    {canCopy && (
                      <Tooltip title="Copy content to clipboard" placement="right">
                        <CopyToClipboard text={m.message} onCopy={() => notify('Post copied to clipboard', 'info')}>
                          <IconButton>
                            <FileCopyIcon />
                          </IconButton>
                        </CopyToClipboard>
                      </Tooltip>
                    )}
                    {canRemove && (
                      <Tooltip title="Remove community update" placement="right">
                        <IconButton
                          onClick={() => {
                            setRemovedMessageId(m.id);
                            setShowConfirmationDialog(true);
                          }}
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
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CardActions>
                )}
              </Card>
              {disableElevation && i !== lastItemIndex && <Divider variant="inset" />}
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
