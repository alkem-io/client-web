import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import PageContentBlockGrid from '../../../../core/ui/content/PageContentBlockGrid';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import JourneyCardHorizontal, {
  JourneyCardHorizontalSkeleton,
} from '../../../../domain/journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import { useMembershipSuggestionSpaceQuery } from '../../../../core/apollo/generated/apollo-hooks';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import SearchSuggestions from '../../../../core/ui/search/SearchSuggestions';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import GridItem from '../../../../core/ui/grid/GridItem';
import { SEARCH_TERMS_URL_PARAM } from '../../../search/constants';
import Gutters from '../../../../core/ui/grid/Gutters';

const MembershipSuggestions: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [filter, setFilter] = useState<string[]>([]);

  const { data, loading } = useMembershipSuggestionSpaceQuery({
    variables: {
      // Id of the space suggested is comming from the translation:
      id: t('pages.home.sections.membershipSuggestions.suggestedSpace.nameId'),
    },
    errorPolicy: 'ignore',
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
          title={t('pages.home.sections.membershipSuggestions.title')}
          fullWidth
        />
        <GridItem columns={4}>
          <Gutters disablePadding>
            <BlockSectionTitle>{t('pages.home.sections.membershipSuggestions.suggestedSpace.join')}</BlockSectionTitle>
            {loading && <JourneyCardHorizontalSkeleton />}
            {!loading && data?.space && (
              <JourneyCardHorizontal
                journeyTypeName="space"
                journey={data.space}
                deepness={0}
                sx={{ display: 'inline-block', maxWidth: '100%' }}
              />
            )}
          </Gutters>
        </GridItem>
        <GridItem columns={4}>
          <Gutters disablePadding>
            <BlockSectionTitle>
              {t('pages.home.sections.membershipSuggestions.searchCommunity.title')}
            </BlockSectionTitle>
            <MultipleSelect
              onChange={setFilter}
              onSearchClick={handleNavigateToSearchPage}
              value={filter}
              minLength={2}
              size="small"
            />
            <SearchSuggestions
              title={t('pages.home.sections.membershipSuggestions.searchCommunity.searchSuggestions')}
              options={t('pages.home.sections.membershipSuggestions.suggestionsArray', { returnObjects: true })}
              onSelect={term => setFilter([...filter, term].slice(0, 5))}
              value={filter}
            />
          </Gutters>
        </GridItem>
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

export default MembershipSuggestions;
