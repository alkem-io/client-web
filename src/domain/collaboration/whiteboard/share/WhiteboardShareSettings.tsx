import { BlockSectionTitle, BlockTitle, Caption } from '@core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '@core/ui/grid/Gutters';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import GridItem from '@core/ui/grid/GridItem';
import ContributorCardHorizontal from '@core/ui/card/ContributorCardHorizontal';
import { Location } from '@core/ui/location/getLocationString';
import { useEffect, useState } from 'react';
import { ContentUpdatePolicy } from '@core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

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
  value: ContentUpdatePolicy | undefined;
  onChange?: (contentUpdatePolicy: ContentUpdatePolicy) => void;
  loading?: boolean;
  updating?: boolean;
  journeyTypeName: JourneyTypeName;
}

const OPTIONS = [ContentUpdatePolicy.Contributors, ContentUpdatePolicy.Admins, ContentUpdatePolicy.Owner];

const WhiteboardShareSettings = ({
  createdBy,
  value,
  onChange,
  loading = false,
  updating = false,
  journeyTypeName,
}: WhiteboardShareSettingsProps) => {
  const { t } = useTranslation();

  const [shareSettings, setShareSettings] = useState(value);

  const handleSettingsChange = (event: unknown, value: string) => {
    setShareSettings(value as ContentUpdatePolicy);
    onChange?.(value as ContentUpdatePolicy);
  };

  useEffect(() => {
    if (!updating) {
      setShareSettings(value);
    }
  }, [value, updating]);

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
            {createdBy && <ContributorCardHorizontal profile={createdBy.profile} seamless />}
          </Gutters>
        </GridItem>
        <GridItem columns={4}>
          <Gutters disablePadding>
            <BlockSectionTitle>{t('components.shareSettings.editableBy.title')}</BlockSectionTitle>
            <FormControl disabled={loading || updating}>
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
                    label={
                      <Caption>
                        {t(`components.shareSettings.editableBy.options.${option}` as const, {
                          journey: t(`common.${journeyTypeName}` as const),
                        })}
                      </Caption>
                    }
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
