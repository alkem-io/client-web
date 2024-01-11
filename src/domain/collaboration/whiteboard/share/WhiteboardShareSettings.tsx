import { BlockSectionTitle, BlockTitle, Caption } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import GridItem from '../../../../core/ui/grid/GridItem';
import ContributorCardHorizontal from '../../../../core/ui/card/ContributorCardHorizontal';
import { Location } from '../../../../core/ui/location/getLocationString';
import { useState } from 'react';

interface WhiteboardShareSettingsProps {
  createdBy:
    | {
        profile: {
          displayName: string;
          location?: Location;
          avatar?: {
            uri: string;
          };
          url: string;
        };
      }
    | undefined;
}

export enum WhiteboardRtShareSettingsOption {
  Contributors = 'contributors',
  Admins = 'admins',
  Owner = 'owner',
}

const OPTIONS = [
  WhiteboardRtShareSettingsOption.Contributors,
  WhiteboardRtShareSettingsOption.Admins,
  WhiteboardRtShareSettingsOption.Owner,
];

const WhiteboardShareSettings = ({ createdBy }: WhiteboardShareSettingsProps) => {
  const { t } = useTranslation();

  const [shareSettings, setShareSettings] = useState<WhiteboardRtShareSettingsOption>(
    WhiteboardRtShareSettingsOption.Contributors
  );

  const handleSettingsChange = (event: unknown, value: string) => {
    // TODO submit value to backend
    setShareSettings(value as WhiteboardRtShareSettingsOption);
  };

  return (
    <>
      <Gutters paddingX={0}>
        <BlockTitle>{t('common.settings')}</BlockTitle>
        <Caption>{t('components.shareSettings.description')}</Caption>
      </Gutters>
      <Gutters row disablePadding>
        <GridItem columns={4}>
          <Gutters disablePadding>
            <BlockSectionTitle>{t('components.shareSettings.ownedBy.title')}</BlockSectionTitle>
            {createdBy && <ContributorCardHorizontal profile={createdBy.profile} url={createdBy.profile.url} />}
          </Gutters>
        </GridItem>
        <GridItem columns={4}>
          <Gutters disablePadding>
            <BlockSectionTitle>{t('components.shareSettings.editableBy.title')}</BlockSectionTitle>
            <FormControl>
              <RadioGroup
                aria-labelledby="whiteboard-rt-share-settings"
                value={shareSettings}
                onChange={handleSettingsChange}
              >
                {OPTIONS.map(option => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio />}
                    label={<Caption>{t(`components.shareSettings.editableBy.options.${option}` as const)}</Caption>}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Gutters>
        </GridItem>
      </Gutters>
    </>
  );
};

export default WhiteboardShareSettings;
