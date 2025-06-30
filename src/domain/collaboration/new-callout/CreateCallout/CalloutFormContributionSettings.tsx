import { useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { gutters } from '@/core/ui/grid/utils';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentBlockCollapsible from '@/core/ui/content/PageContentBlockCollapsible';
import { useScreenSize } from '@/core/ui/grid/constants';
import FormikRadioButtonsGroup from '@/core/ui/forms/radioButtons/FormikRadioButtonsGroup';
import CommentsDisabledOutlinedIcon from '@mui/icons-material/CommentsDisabledOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import { CalloutStructuredResponseType } from './CalloutForm';
import BlockIcon from '@mui/icons-material/Block';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import calloutIcons from '../../callout/utils/calloutIcons';
import { CalloutContributionType, CalloutType } from '@/core/apollo/generated/graphql-schema';
import ContributionSettingsDialog from './ContributionSettingsDialog/ContributionSettingsDialog';
import ContributionsSettingsLink from './ContributionSettingsDialog/ContributionsSettingsLink';
import ContributionsSettingsPost from './ContributionSettingsDialog/ContributionsSettingsPost';
import ContributionsSettingsWhiteboard from './ContributionSettingsDialog/ContributionsSettingsWhiteboard';
import { CalloutRestrictions } from './CreateCalloutDialog';

interface CalloutFormContributionSettingsProps {
  calloutRestrictions?: CalloutRestrictions;
}

const CalloutFormContributionSettings = ({ calloutRestrictions }: CalloutFormContributionSettingsProps) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();
  const [responseContributionType, setResponseContributionType] = useState<CalloutStructuredResponseType>('none');
  const [contributionSettingsDialogOpen, setContributionSettingsDialogOpen] = useState<boolean>(false);

  const SettingsComponent = useMemo(() => {
    switch (responseContributionType) {
      case CalloutContributionType.Link:
        return ContributionsSettingsLink;
      case CalloutContributionType.Post:
        return ContributionsSettingsPost;
      case CalloutContributionType.Whiteboard:
        return ContributionsSettingsWhiteboard;
      default:
        return undefined;
    }
  }, [responseContributionType]);

  return (
    <PageContentBlockCollapsible
      header={<PageContentBlockHeader title={t('callout.create.contributionSettings.title')} />}
      seamless
    >
      <Box display="flex" gap={gutters()} flexDirection={isMediumSmallScreen ? 'column' : 'row'}>
        <PageContentBlock sx={{ flex: 1 }}>
          <PageContentBlockHeader title={t('callout.create.contributionSettings.comments.title')} />
          <FormikRadioButtonsGroup
            options={[
              {
                icon: CommentsDisabledOutlinedIcon,
                value: false,
                label: t('callout.create.contributionSettings.comments.disabled'),
              },
              {
                icon: CommentOutlinedIcon,
                value: true,
                label: t('callout.create.contributionSettings.comments.enabled'),
              },
            ]}
            name="settings.framing.commentsEnabled"
            labelPlacement="bottom"
          />
        </PageContentBlock>
        <PageContentBlock sx={{ flex: 3 }}>
          <PageContentBlockHeader title={t('callout.create.contributionSettings.contributionTypes.title')} />
          <FormikRadioButtonsGroup
            options={[
              {
                icon: BlockIcon,
                value: 'none' as CalloutStructuredResponseType,
                label: t('callout.create.contributionSettings.contributionTypes.none.title'),
                tooltip: t('callout.create.contributionSettings.contributionTypes.none.tooltip'),
              },
              {
                icon: AttachFileOutlinedIcon,
                value: CalloutContributionType.Link,
                label: t('callout.create.contributionSettings.contributionTypes.link.title'),
                tooltip: t('callout.create.contributionSettings.contributionTypes.link.tooltip'),
              },
              {
                icon: calloutIcons[CalloutType.PostCollection],
                value: CalloutContributionType.Post,
                label: t('callout.create.contributionSettings.contributionTypes.post.title'),
                tooltip: t('callout.create.contributionSettings.contributionTypes.post.tooltip'),
              },
              {
                icon: calloutIcons[CalloutType.Whiteboard],
                value: CalloutContributionType.Whiteboard,
                label: t('callout.create.contributionSettings.contributionTypes.whiteboard.title'),
                tooltip: t('callout.create.contributionSettings.contributionTypes.whiteboard.tooltip'),
                disabled: calloutRestrictions?.disableWhiteboards,
              },
            ]}
            name="settings.contribution.allowedTypes"
            labelPlacement="bottom"
            onChange={value => setResponseContributionType(value)}
          >
            <Box display="flex" alignItems="end" marginLeft="auto">
              <Button
                variant="outlined"
                onClick={() => setContributionSettingsDialogOpen(true)}
                disabled={responseContributionType === 'none'}
              >
                {t('callout.create.contributionSettings.contributionTypes.settings.title')}
              </Button>
            </Box>
          </FormikRadioButtonsGroup>
        </PageContentBlock>
      </Box>
      <ContributionSettingsDialog
        open={contributionSettingsDialogOpen}
        onClose={() => setContributionSettingsDialogOpen(false)}
        contributionTypeSettingsComponent={SettingsComponent}
        calloutRestrictions={calloutRestrictions}
      />
    </PageContentBlockCollapsible>
  );
};

export default CalloutFormContributionSettings;
