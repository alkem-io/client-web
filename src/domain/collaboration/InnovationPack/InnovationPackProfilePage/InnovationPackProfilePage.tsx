import React from 'react';
import InnovationPackProfileLayout from './InnovationPackProfileLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import GridItem from '../../../../core/ui/grid/GridItem';
import { Box } from '@mui/material';
import { BlockSectionTitle, Text } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { gutters } from '../../../../core/ui/grid/utils';
import Gutters from '../../../../core/ui/grid/Gutters';

const InnovationPackProfilePage = () => {
  const { t } = useTranslation();

  return (
    <InnovationPackProfileLayout displayName="I'm the Pack" currentSection={EntityPageSection.Profile}>
      <PageContent>
        <PageContentColumn columns={12}>
          <PageContentBlock sx={{ flexDirection: 'row' }}>
            <GridItem columns={6}>
              <Gutters disablePadding>
                <PageContentBlockHeader title={'Alkemio Innovation Pack'} />
                <WrapperMarkdown disableParagraphPadding>
                  Qorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac
                  aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos
                  himenaeos. Curabitur tempus urna at turpis condimentum lobortis.Description: Qorem ipsum dolor sit
                  amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
                  Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur
                  tempus urna at turpis condimentum.
                </WrapperMarkdown>
              </Gutters>
            </GridItem>
            <GridItem columns={6}>
              <Box>
                <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
                <Box height={gutters(2)} display="flex" alignItems="center">
                  <TagsComponent
                    tags={['Whiteboards', 'Whiteboards', 'Whiteboards']}
                    variant="filled"
                    size="medium"
                    color="primary"
                    height={gutters(2)}
                  />
                </Box>
                <BlockSectionTitle>{t('common.references')}</BlockSectionTitle>
                <Text>Our Spotify Playlist</Text>
                <Text>Our Spotify Playlist</Text>
              </Box>
            </GridItem>
          </PageContentBlock>
          <PageContentBlock>
            <PageContentBlockHeader title={'Whiteboard Templates (5)'} />
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
    </InnovationPackProfileLayout>
  );
};

export default InnovationPackProfilePage;
