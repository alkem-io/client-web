import { useCalloutsSetTagsQuery } from '@/core/apollo/generated/apollo-hooks';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import { Caption } from '@/core/ui/typography';
import { Box, Chip, Divider, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ClassificationTagsetModel } from '../Classification/ClassificationTagset.model';
import { classificationTagsetModelToTagsetArgs } from '../Classification/ClassificationTagset.utils';
import TwoLinesTagsContainer from './TwoLinesTagsContainer';

export interface CalloutsSetTagCloudProps {
  calloutsSetId: string | undefined;
  classificationTagsets?: ClassificationTagsetModel[];
  selectedTags: string[];
  resultsCount?: number;
  onSelectTag: (tag: string) => Promise<unknown> | void;
  onDeselectTag: (tag: string) => Promise<unknown> | void;
  onClear: () => Promise<unknown> | void;
}

const ResultsCount = ({ count, onClear }: { count: number; onClear: () => void }) => {
  const { t } = useTranslation();
  return (
    <Box display="flex" flexDirection="row" justifyContent="center" gap={gutters(0.5)} width="100%">
      <Caption>{t('components.tagCloud.resultsCount', { count })}</Caption>
      <Caption> - </Caption>
      <Caption component={Link} onClick={onClear} sx={{ cursor: 'pointer' }}>
        {t('components.tagCloud.clearFilter')}
      </Caption>
    </Box>
  );
};

const CalloutsSetTagCloud = ({
  calloutsSetId,
  classificationTagsets,
  selectedTags,
  resultsCount,
  onSelectTag,
  onDeselectTag,
  onClear,
}: CalloutsSetTagCloudProps) => {
  const classificationTagsetsArgs = classificationTagsetModelToTagsetArgs(classificationTagsets);

  const { data, loading } = useCalloutsSetTagsQuery({
    variables: {
      calloutsSetId: calloutsSetId!,
      classificationTagsets: classificationTagsetsArgs,
    },
    skip: !calloutsSetId,
  });
  const tags = data?.lookup.calloutsSet?.tags ?? [];

  if (tags.length === 0 && selectedTags.length === 0) {
    return null;
  }

  return (
    <>
      <PageContentBlock>
        {loading && <Loading />}
        {!loading && (
          <Box display="flex" flexDirection="row" flexWrap="nowrap" gap={gutters(0.5)}>
            <Box
              maxWidth="50%"
              display="flex"
              flexDirection="row"
              flexWrap="wrap"
              gap={gutters(0.5)}
              alignContent="start"
              whiteSpace="nowrap"
            >
              {selectedTags.map(chip => (
                <Chip
                  key={chip}
                  label={chip}
                  color="primary"
                  variant="filled"
                  size="small"
                  onClick={() => onDeselectTag(chip)}
                  onDelete={() => onDeselectTag(chip)}
                />
              ))}
            </Box>
            {selectedTags.length > 0 && <Divider orientation="vertical" />}
            <TwoLinesTagsContainer tags={tags.filter(tag => !selectedTags.includes(tag))} onClickTag={onSelectTag} />
          </Box>
        )}
      </PageContentBlock>
      {resultsCount !== undefined && selectedTags.length > 0 && <ResultsCount count={resultsCount} onClear={onClear} />}
    </>
  );
};

export default CalloutsSetTagCloud;
