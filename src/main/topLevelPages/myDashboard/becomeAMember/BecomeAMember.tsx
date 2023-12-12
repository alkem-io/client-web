import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import PageContentBlockGrid from '../../../../core/ui/content/PageContentBlockGrid';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { Box } from '@mui/material';
import { useWelcomeSpaceQuery } from '../../../../core/apollo/generated/apollo-hooks';
import JourneyCardHorizontal, {
  JourneyCardHorizontalSkeleton,
} from '../../../../domain/journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import SearchSuggestions from '../../../../core/ui/search/SearchSuggestions';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import GridItem from '../../../../core/ui/grid/GridItem';
import { SEARCH_TERMS_URL_PARAM } from '../../../search/constants';

const BecomeAMember: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [filter, setFilter] = useState<string[]>([]);

  const { data, loading } = useWelcomeSpaceQuery({
    variables: {
      // Id of the space suggested is comming from the translation:
      id: t('pages.home.sections.becomeAMember.suggestedSpace.nameId'),
    },
  });

  const handleNavigateToSearchPage = (terms: string[]) => {
    if (!terms.length) {
      return;
    }
    const params = new URLSearchParams();
    terms.forEach(term => params.append(SEARCH_TERMS_URL_PARAM, term));
    navigate(`${pathname}?${params}`);
  };

  return (
    <PageContentBlock disableGap disablePadding>
      <PageContentBlockGrid>
        <PageContentBlockHeader
          icon={<RocketLaunchOutlinedIcon />}
          title={t('pages.home.sections.becomeAMember.title')}
          fullWidth
        />
        <GridItem columns={4}>
          <Box>
            <BlockSectionTitle>{t('pages.home.sections.becomeAMember.suggestedSpace.join')}</BlockSectionTitle>
            {loading && <JourneyCardHorizontalSkeleton />}
            {!loading && data?.space && (
              <JourneyCardHorizontal
                journeyTypeName="space"
                journey={data.space}
                deepness={0}
                sx={{ display: 'inline-block', maxWidth: '100%' }}
              />
            )}
          </Box>
        </GridItem>
        <GridItem columns={4}>
          <Box>
            <BlockSectionTitle>{t('pages.home.sections.becomeAMember.searchCommunity.title')}</BlockSectionTitle>
            <MultipleSelect
              onChange={setFilter}
              onSearchClick={handleNavigateToSearchPage}
              value={filter}
              minLength={2}
              containerProps={{
                marginLeft: 'auto',
              }}
              size="small"
            />
            <SearchSuggestions
              title={t('pages.home.sections.becomeAMember.searchCommunity.searchSuggestions')}
              options={t('pages.home.sections.becomeAMember.searchCommunity.suggestionsArray', { returnObjects: true })}
              onSelect={term => setFilter([...filter, term].slice(0, 5))}
              value={filter}
            />
          </Box>
        </GridItem>
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

export default BecomeAMember;
