import { BlockTitle, Caption, Text } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import React from 'react';
import { useField } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';
import ContributorCardHorizontal, {
  SpaceWelcomeSectionContributorProps,
} from '../../../../core/ui/card/ContributorCardHorizontal';
import usePlatformOrigin from '../../../platform/routes/usePlatformOrigin';

export interface SpaceProfileFixedInformationProps {
  visibility: SpaceVisibility;
  host: SpaceWelcomeSectionContributorProps | undefined;
}

const SpaceProfileFixedInformation = ({ visibility, host }: SpaceProfileFixedInformationProps) => {
  const { t } = useTranslation();
  const [{ value: nameId }] = useField('nameID');
  const origin = usePlatformOrigin();

  return (
    <PageContentBlock columns={4} sx={{ gap: gutters(2) }}>
      <Gutters disablePadding>
        <BlockTitle>{t('common.url')}</BlockTitle>
        <Text>{origin && `${origin}/${nameId}`}</Text>
      </Gutters>
      <Gutters disablePadding>
        <BlockTitle>{t('common.visibility')}</BlockTitle>
        <Text>
          <Trans
            t={t}
            i18nKey="components.editSpaceForm.visibility"
            values={{
              visibility: t(`common.enums.space-visibility.${visibility}` as const),
            }}
            components={{
              strong: <strong />,
            }}
          />
        </Text>
      </Gutters>
      <Gutters disablePadding>
        <BlockTitle>{t('pages.community.space-host.title')}</BlockTitle>
        {host && <ContributorCardHorizontal {...host} seamless />}
      </Gutters>
      <Caption fontStyle="italic">{t('components.editSpaceForm.readOnly')}</Caption>
    </PageContentBlock>
  );
};

export default SpaceProfileFixedInformation;
