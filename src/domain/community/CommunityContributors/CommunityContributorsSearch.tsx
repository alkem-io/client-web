import React, { FC, useCallback } from 'react';
import DashboardGenericSection from '../../shared/components/DashboardSections/DashboardGenericSection';
import SearchTagsInput, { CardFilterInputProps } from '../../shared/components/SearchTagsInput/SearchTagsInput';
import { useTranslation } from 'react-i18next';

interface CommunityContributorsSearchProps extends Pick<CardFilterInputProps, 'value'> {
  onChange: (searchTerms: string[]) => void;
}

const CommunityContributorsSearch: FC<CommunityContributorsSearchProps> = ({ onChange, ...props }) => {
  const { t } = useTranslation();

  const handleChange = useCallback((_e: unknown, terms: string[]) => {
    onChange?.(terms);
  }, []);

  return (
    <DashboardGenericSection
      headerText={t('pages.contributor.search.title')}
      subHeaderText={t('pages.contributor.search.subtitle')}
    >
      <SearchTagsInput placeholder={t('pages.contributor.search.placeholder')} onChange={handleChange} {...props} />
    </DashboardGenericSection>
  );
};

export default CommunityContributorsSearch;
