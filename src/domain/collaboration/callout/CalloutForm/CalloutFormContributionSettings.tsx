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
import { CalloutFormSubmittedValues } from './CalloutFormModel';
import BlockIcon from '@mui/icons-material/Block';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import { contributionIcons, GenericCalloutIcon } from '../../callout/icons/calloutIcons';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import ContributionSettingsDialog from './ContributionSettingsDialog/ContributionSettingsDialog';
import ContributionsSettingsLink from './ContributionSettingsDialog/ContributionsSettingsLink';
import ContributionsSettingsPost from './ContributionSettingsDialog/ContributionsSettingsPost';
import ContributionsSettingsWhiteboard from './ContributionSettingsDialog/ContributionsSettingsWhiteboard';
import { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';
import { nameOf } from '@/core/utils/nameOf';
import { useField } from 'formik';

interface CalloutFormContributionSettingsProps {
  calloutRestrictions?: CalloutRestrictions;
}

export type FramingSettings = {
  commentsEnabled: boolean;
  canAddContributions: boolean;
};

const CalloutFormContributionSettings = ({ calloutRestrictions }: CalloutFormContributionSettingsProps) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();
  const [allowedTypesField] = useField<CalloutFormSubmittedValues['settings']['contribution']['allowedTypes']>(
    nameOf<CalloutFormSubmittedValues>('settings.contribution.allowedTypes')
  );
  const [contributionSettingsDialogOpen, setContributionSettingsDialogOpen] = useState<boolean>(false);

  const SettingsComponent = useMemo(() => {
    switch (allowedTypesField.value) {
      case CalloutContributionType.Link:
        return ContributionsSettingsLink;
      case CalloutContributionType.Post:
        return ContributionsSettingsPost;
      case CalloutContributionType.Whiteboard:
        return ContributionsSettingsWhiteboard;
      case CalloutContributionType.Memo:
        return ContributionsSettingsPost; // Memo uses same settings as Post
      default:
        return undefined;
    }
  }, [allowedTypesField.value]);

  const enabledSettings: FramingSettings = useMemo(() => {
    const result: FramingSettings = {
      commentsEnabled: true,
      canAddContributions: true,
    };

    switch (allowedTypesField.value) {
      case CalloutContributionType.Link:
      case CalloutContributionType.Whiteboard:
      case CalloutContributionType.Memo: {
        result.commentsEnabled = false;
      }
    }

    return result;
  }, [allowedTypesField.value]);

  const disabledTooltip = t('callout.create.contributionSettings.contributionTypes.tooltipDisabled');

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
                disabled: calloutRestrictions?.disableComments,
              },
            ]}
            name={nameOf<CalloutFormSubmittedValues>('settings.framing.commentsEnabled')}
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
                tooltip: calloutRestrictions?.readOnlyAllowedTypes
                  ? disabledTooltip
                  : t('callout.create.contributionSettings.contributionTypes.link.tooltip'),
              },
              {
                icon: GenericCalloutIcon,
                value: CalloutContributionType.Post,
                label: t('callout.create.contributionSettings.contributionTypes.post.title'),
                tooltip: calloutRestrictions?.readOnlyAllowedTypes
                  ? disabledTooltip
                  : t('callout.create.contributionSettings.contributionTypes.post.tooltip'),
              },
              {
                icon: contributionIcons[CalloutContributionType.Memo],
                value: CalloutContributionType.Memo,
                label: t('callout.create.contributionSettings.contributionTypes.memo.title'),
                tooltip: calloutRestrictions?.readOnlyAllowedTypes
                  ? disabledTooltip
                  : t('callout.create.contributionSettings.contributionTypes.memo.tooltip'),
                disabled: calloutRestrictions?.disableMemos,
              },
              {
                icon: contributionIcons[CalloutContributionType.Whiteboard],
                value: CalloutContributionType.Whiteboard,
                label: t('callout.create.contributionSettings.contributionTypes.whiteboard.title'),
                tooltip: calloutRestrictions?.readOnlyAllowedTypes
                  ? disabledTooltip
                  : t('callout.create.contributionSettings.contributionTypes.whiteboard.tooltip'),
                disabled: calloutRestrictions?.disableWhiteboards,
              },
            ]}
            name="settings.contribution.allowedTypes"
            labelPlacement="bottom"
            readOnly={calloutRestrictions?.readOnlyAllowedTypes}
          >
            <Box display="flex" alignItems="end" marginLeft="auto">
              <Button
                variant="outlined"
                onClick={() => setContributionSettingsDialogOpen(true)}
                disabled={allowedTypesField.value === 'none'}
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
        enabledSettings={enabledSettings}
      />
    </PageContentBlockCollapsible>
  );
};

export default CalloutFormContributionSettings;
