import { FC } from 'react';
import { gutters } from '../../../../core/ui/grid/utils';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import References from '../../../shared/components/References/References';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { InnovationFlowProfileBlockProps } from './InnovationFlowProfileBlock';
import { useTranslation } from 'react-i18next';

interface InnovationFlowProfileViewProps {
  innovationFlow: InnovationFlowProfileBlockProps['innovationFlow'];
}

const InnovationFlowProfileView: FC<InnovationFlowProfileViewProps> = ({ innovationFlow }) => {
  const { t } = useTranslation();
  return (
    <>
      <WrapperMarkdown>{innovationFlow?.profile.description ?? ''}</WrapperMarkdown>
      <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
      <TagsComponent
        tags={
          /*innovationFlow?.profile.tagsets?.flatMap(tagset => tagset.tags) ?? [] */ [
            'mock',
            'these',
            'tags',
            'TODO!!',
            '//!!',
            'remove this',
          ]
        }
        color="primary"
        gap={gutters(0.5)}
        height={gutters(2.5)}
        canShowAll
      />
      <BlockSectionTitle>{t('common.references')}</BlockSectionTitle>
      <References
        references={
          /*innovationFlow?.profile.references */ [
            {
              id: '1',
              name: 'Reference 1',
              description: 'Description of Reference 1',
              uri: 'http://google.com',
            },
            { id: '2', name: 'Our Spotify List', description: 'Our Spotify List', uri: 'http://spotify.com' },
            {
              id: '3',
              name: 'Mocked References',
              description: 'Remove TODO!! //!!',
              uri: 'http://alkemio.com',
            },
          ]
        }
        compact
      />
    </>
  );
};

export default InnovationFlowProfileView;
