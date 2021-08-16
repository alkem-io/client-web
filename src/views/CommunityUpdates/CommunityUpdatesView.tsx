import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  Grid,
  GridProps,
  IconButton,
  makeStyles,
} from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import MDEditor from '@uiw/react-md-editor';
import { Form, Formik } from 'formik';
import orderBy from 'lodash/orderBy';
import React, { FC, useMemo, useState } from 'react';
import * as yup from 'yup';
import { useMarkdownInputField } from '../../components/Admin/Common/useMarkdownInputField';
import Button from '../../components/core/Button';
import { CommunicationMessageResult, CommunityDetailsFragment } from '../../models/graphql-schema';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';
import { keyBy } from 'lodash';

export interface CommunityUpdatesViewProps {
  entities: {
    messages: CommunicationMessageResult[];
    members: CommunityDetailsFragment['members'];
  };
  state: {
    loadingMessages: boolean;
    submittingMessage: boolean;
  };
  actions: {
    onSubmit: (value: string) => Promise<void>;
  };
  options?: {
    edit?: boolean;
    itemsPerRow?: number;
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
  // entities
  const { messages, members } = entities;
  const { loadingMessages } = state;
  const { edit: canEdit, itemsPerRow } = options || {};
  const orderedMessages = useMemo(() => orderBy(messages, x => x.timestamp, ['desc']), [messages]);
  const initialValues = {
    'community-update': '',
  };
  const validationSchema = yup.object().shape({
    'community-update': yup.string(),
  });
  const [reviewedMessage, setReviewedMessage] = useState<string | null>(null);
  const memberMap = useMemo(() => keyBy(members, m => m.email), [members]);

  // styling
  const styles = useStyles();
  // components
  const getMarkdownInput = useMarkdownInputField();

  return (
    <>
      {canEdit && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={(values, { setSubmitting }) =>
            actions.onSubmit(values['community-update']).finally(() => setSubmitting(false))
          }
        >
          {({ handleSubmit, isSubmitting }) => {
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {getMarkdownInput({ name: 'community-update', rows: 30, label: '' })}
                  </Grid>
                  <Grid container item xs={12} justifyContent="flex-end">
                    <Button
                      text={'Post update'}
                      type={'submit'}
                      startIcon={isSubmitting ? <CircularProgress size={24} /> : <PlayArrowIcon />}
                    />
                  </Grid>
                </Grid>
              </Form>
            );
          }}
        </Formik>
      )}
      <Grid container spacing={2}>
        {orderedMessages.map(m => {
          const expanded = reviewedMessage === m.id;
          return (
            <Grid item xs={12} lg={(12 / (itemsPerRow || 2)) as keyof GridProps['lg']}>
              <Card key={m.id} elevation={2}>
                <CardHeader
                  title={memberMap[m.sender]?.displayName || m.sender}
                  subheader={new Date(m.timestamp).toISOString()}
                />
                <CardContent className={styles.root}>
                  <Collapse in={expanded} timeout="auto" collapsedSize={40}>
                    <Box>
                      <MDEditor.Markdown source={m.message} />
                    </Box>
                    {!expanded && <Box className={styles.rootFade}></Box>}
                  </Collapse>
                </CardContent>
                <CardActions disableSpacing>
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
                </CardActions>
              </Card>
            </Grid>
          );
        })}
        {loadingMessages && (
          <Grid container item xs={12} justifyContent="center">
            <CircularProgress />
          </Grid>
        )}
      </Grid>
    </>
  );
};
