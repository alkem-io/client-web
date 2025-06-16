import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { gutters } from '@/core/ui/grid/utils';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import ExpandableBlock from '@/core/ui/content/ExpandableBlock/ExpandableBlock';
import { useScreenSize } from '@/core/ui/grid/constants';
import RadioButtonsGroup from '@/core/ui/forms/radioButtons/RadioButtonsGroup';
import CommentsDisabledOutlinedIcon from '@mui/icons-material/CommentsDisabledOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import { CalloutStructuredResponseType } from './constants';
import BlockIcon from '@mui/icons-material/Block';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import calloutIcons from '../../callout/utils/calloutIcons';
import { CalloutType } from '@/core/apollo/generated/graphql-schema';

interface CalloutFormResponseOptionsProps {}

const CalloutFormResponseOptions = ({}: CalloutFormResponseOptionsProps) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();
  const [commentsEnabled, setCommentsEnabled] = useState<boolean>(true);
  const [structuredResponseType, setStructuredResponseType] = useState<CalloutStructuredResponseType>(
    CalloutStructuredResponseType.None
  );

  return (
    <ExpandableBlock title={t('callout.create.responseOptions.title')}>
      <Box display="flex" gap={gutters()} flexDirection={isMediumSmallScreen ? 'column' : 'row'}>
        <PageContentBlock sx={{ flex: 1 }}>
          <PageContentBlockHeader title={t('callout.create.responseOptions.comments.title')} />
          <RadioButtonsGroup
            options={[
              {
                icon: CommentsDisabledOutlinedIcon,
                value: false,
                label: t('callout.create.responseOptions.comments.disabled'),
              },
              {
                icon: CommentOutlinedIcon,
                value: true,
                label: t('callout.create.responseOptions.comments.enabled'),
              },
            ]}
            value={commentsEnabled}
            onChange={value => setCommentsEnabled(value)}
          />
        </PageContentBlock>
        <PageContentBlock sx={{ flex: 3 }}>
          <PageContentBlockHeader title={t('callout.create.responseOptions.structuredResponses.title')} />
          <RadioButtonsGroup
            options={[
              {
                icon: BlockIcon,
                value: CalloutStructuredResponseType.None,
                label: t('callout.create.responseOptions.structuredResponses.none.title'),
                tooltip: t('callout.create.responseOptions.structuredResponses.none.tooltip'),
              },
              {
                icon: AttachFileOutlinedIcon,
                value: CalloutStructuredResponseType.Links,
                label: t('callout.create.responseOptions.structuredResponses.links.title'),
                tooltip: t('callout.create.responseOptions.structuredResponses.links.tooltip'),
              },
              {
                icon: calloutIcons[CalloutType.PostCollection],
                value: CalloutStructuredResponseType.Posts,
                label: t('callout.create.responseOptions.structuredResponses.posts.title'),
                tooltip: t('callout.create.responseOptions.structuredResponses.posts.tooltip'),
              },
              {
                icon: calloutIcons[CalloutType.Whiteboard],
                value: CalloutStructuredResponseType.Whiteboards,
                label: t('callout.create.responseOptions.structuredResponses.whiteboards.title'),
                tooltip: t('callout.create.responseOptions.structuredResponses.whiteboards.tooltip'),
              },
            ]}
            value={structuredResponseType}
            onChange={value => setStructuredResponseType(value)}
          />
          <Button variant="outlined">Response Settings</Button>
        </PageContentBlock>
      </Box>
    </ExpandableBlock>
  );
};

export default CalloutFormResponseOptions;
