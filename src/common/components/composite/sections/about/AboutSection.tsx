import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import { Tagline, Text } from '../../../../../core/ui/typography';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { SectionSpacer } from '../../../../../domain/shared/components/Section/Section';
import { ApolloError } from '@apollo/client';

interface AboutSectionProps {
  infoBlockTitle: string;
  infoBlockText: string;
  tags: string[];
  who: string;
  vision: string;
  loading: boolean | undefined;
  error?: ApolloError
}

const BLOCK_HEIGHT = 260;

export const AboutSection: FC<AboutSectionProps> = ({ infoBlockTitle, infoBlockText, vision, tags, loading }) => {
  const { t } = useTranslation();

  return (
    <>
      <PageContent>
        <PageContentColumn columns={4}>
          <PageContentBlock accent>
            <Text>{infoBlockTitle}</Text>
            <Tagline>{infoBlockText}</Tagline>
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={8} sx={{ height: BLOCK_HEIGHT }}>
          <PageContentBlock>
            <Text>
              {t('pages.about.vision')}
            </Text>
            <SectionSpacer />
            <Text>
              {vision}
            </Text>
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
    </>
  );
};
