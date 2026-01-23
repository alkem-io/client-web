import { BlockSectionTitle, BlockTitle, Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '@/core/ui/grid/Gutters';
import { Alert, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import GridItem from '@/core/ui/grid/GridItem';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import { Location } from '@/core/ui/location/getLocationString';
import { useEffect, useState } from 'react';
import { ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import useContentUpdatePolicyManager from './useContentUpdatePolicyManager';

type CollaborationSettingsProps = {
  element:
    | (Identifiable & {
        createdBy?:
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
      })
    | undefined;
  elementType: 'whiteboard' | 'memo';
  guestAccessEnabled?: boolean;
};

const OPTIONS = [ContentUpdatePolicy.Contributors, ContentUpdatePolicy.Admins, ContentUpdatePolicy.Owner];

const CollaborationSettings = ({ element, elementType, guestAccessEnabled }: CollaborationSettingsProps) => {
  const { t } = useTranslation();
  const { contentUpdatePolicy, loading, updating, onChange } = useContentUpdatePolicyManager({
    elementId: element?.id,
    elementType,
    skip: !element?.id || !elementType,
  });

  const [shareSettings, setShareSettings] = useState(contentUpdatePolicy);

  const handleSettingsChange = (event: unknown, value: string) => {
    setShareSettings(value as ContentUpdatePolicy);
    onChange?.(value as ContentUpdatePolicy);
  };

  useEffect(() => {
    if (!updating) {
      setShareSettings(contentUpdatePolicy);
    }
  }, [contentUpdatePolicy, updating]);

  const elementName = t(`common.${elementType}`);
  return (
    <>
      <Gutters paddingX={0}>
        <BlockTitle>{t('common.Settings')}</BlockTitle>
        <Caption>{t('components.shareSettings.description', { elementName })}</Caption>
      </Gutters>
      <Gutters row disablePadding>
        <GridItem columns={4}>
          <Gutters disablePadding>
            <BlockSectionTitle>{t('components.shareSettings.ownedBy.title', { elementName })}</BlockSectionTitle>
            {element?.createdBy && <ContributorCardHorizontal profile={element.createdBy.profile} seamless />}
          </Gutters>
        </GridItem>
        <GridItem columns={4}>
          <Gutters disablePadding>
            <BlockSectionTitle id="rt-collaboration-share-settings">
              {t('components.shareSettings.editableBy.title', { elementName })}
            </BlockSectionTitle>
            {guestAccessEnabled && (
              <Alert severity="warning" sx={{ marginBottom: 1 }}>
                {t('components.shareSettings.guestAccessWarning')}
              </Alert>
            )}
            <FormControl disabled={loading || updating}>
              <RadioGroup
                aria-labelledby="rt-collaboration-share-settings"
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
                        {t(`components.shareSettings.editableBy.options.${option}` as const, { elementName })}
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

export default CollaborationSettings;
