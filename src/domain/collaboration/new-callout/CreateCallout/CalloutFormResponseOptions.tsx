import { useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { gutters } from '@/core/ui/grid/utils';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentBlockCollapsible from '@/core/ui/content/PageContentBlockCollapsible';
import { useScreenSize } from '@/core/ui/grid/constants';
import RadioButtonsGroup from '@/core/ui/forms/radioButtons/RadioButtonsGroup';
import CommentsDisabledOutlinedIcon from '@mui/icons-material/CommentsDisabledOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import type { CalloutStructuredResponseType } from './constants';
import BlockIcon from '@mui/icons-material/Block';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import calloutIcons from '../../callout/utils/calloutIcons';
import { CalloutContributionType, CalloutType } from '@/core/apollo/generated/graphql-schema';
import CalloutFormResponseSettingsDialog from './ResponseSettingsDialog/CalloutFormResponseSettingsDialog';
import ResponseSettingsLink from './ResponseSettingsDialog/ResponseSettingsLink';
import ResponseSettingsPosts from './ResponseSettingsDialog/ResponseSettingsPost';
import ResponseSettingsWhiteboards from './ResponseSettingsDialog/ResponseSettingsWhiteboard';

interface CalloutFormResponseOptionsProps {}

const CalloutFormResponseOptions = ({}: CalloutFormResponseOptionsProps) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();
  const [commentsEnabled, setCommentsEnabled] = useState<boolean>(true);
  const [structuredResponseType, setStructuredResponseType] = useState<CalloutStructuredResponseType>('none');
  const [responseSettingsDialogOpen, setResponseSettingsDialogOpen] = useState<boolean>(false);

  const SettingsComponent = useMemo(() => {
    switch (structuredResponseType) {
      case CalloutContributionType.Link:
        return ResponseSettingsLink;
      case CalloutContributionType.Post:
        return ResponseSettingsPosts;
      case CalloutContributionType.Whiteboard:
        return ResponseSettingsWhiteboards;
      default:
        return undefined;
    }
  }, [structuredResponseType]);

  return (
    <PageContentBlockCollapsible
      header={<PageContentBlockHeader title={t('callout.create.responseOptions.title')} />}
      seamless
    >
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
            labelPlacement="bottom"
            onChange={value => setCommentsEnabled(value)}
          />
        </PageContentBlock>
        <PageContentBlock sx={{ flex: 3 }}>
          <PageContentBlockHeader title={t('callout.create.responseOptions.structuredResponses.title')} />
          <RadioButtonsGroup
            options={[
              {
                icon: BlockIcon,
                value: 'none' as CalloutStructuredResponseType,
                label: t('callout.create.responseOptions.structuredResponses.none.title'),
                tooltip: t('callout.create.responseOptions.structuredResponses.none.tooltip'),
              },
              {
                icon: AttachFileOutlinedIcon,
                value: CalloutContributionType.Link,
                label: t('callout.create.responseOptions.structuredResponses.links.title'),
                tooltip: t('callout.create.responseOptions.structuredResponses.links.tooltip'),
              },
              {
                icon: calloutIcons[CalloutType.PostCollection],
                value: CalloutContributionType.Post,
                label: t('callout.create.responseOptions.structuredResponses.posts.title'),
                tooltip: t('callout.create.responseOptions.structuredResponses.posts.tooltip'),
              },
              {
                icon: calloutIcons[CalloutType.Whiteboard],
                value: CalloutContributionType.Whiteboard,
                label: t('callout.create.responseOptions.structuredResponses.whiteboards.title'),
                tooltip: t('callout.create.responseOptions.structuredResponses.whiteboards.tooltip'),
              },
            ]}
            value={structuredResponseType}
            labelPlacement="bottom"
            onChange={value => setStructuredResponseType(value)}
          >
            <Box display="flex" alignItems="end" marginLeft="auto">
              <Button
                variant="outlined"
                onClick={() => setResponseSettingsDialogOpen(true)}
                disabled={structuredResponseType === 'none'}
              >
                {t('callout.create.responseOptions.responseSettings.title')}
              </Button>
            </Box>
          </RadioButtonsGroup>
        </PageContentBlock>
      </Box>
      <CalloutFormResponseSettingsDialog
        open={responseSettingsDialogOpen}
        onClose={() => setResponseSettingsDialogOpen(false)}
        settingsComponent={SettingsComponent}
      />
    </PageContentBlockCollapsible>
  );
};

export default CalloutFormResponseOptions;
