import { Link } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Discussion } from '../../../communication/discussion/models/Discussion';
import { RouterLink } from '../../../../common/components/core/RouterLink';
import DiscussionOverview from '../../../communication/discussion/views/DiscussionOverview';
import DashboardGenericSection from './DashboardGenericSection';

export interface DashboardDiscussionsSectionProps {
  discussions: Discussion[];
  isMember: boolean;
}

const DISCUSSIONS_NUMBER_IN_SECTION = 3;
/**
 * @deprecated ???
 * @param param0
 * @returns
 */
const DashboardDiscussionsSection: FC<DashboardDiscussionsSectionProps> = ({ discussions, isMember }) => {
  const { t } = useTranslation();

  const discussionsInCard = useMemo(
    () =>
      discussions
        .sort((a, b) =>
          a.createdAt && b.createdAt ? b.createdAt.getTime() - a.createdAt?.getTime() : b.title.localeCompare(a.title)
        )
        .slice(0, DISCUSSIONS_NUMBER_IN_SECTION),
    [discussions]
  );

  return (
    <DashboardGenericSection
      headerText={t('dashboard-discussions-section.title', { count: discussions.length })}
      navText={t('buttons.see-all')}
      navLink={'discussions'}
    >
      {discussionsInCard.map((item, index) => (
        <DiscussionOverview key={index} discussion={item} />
      ))}
      {!discussionsInCard.length && (
        <Link component={RouterLink} to={isMember ? '../discussions/new' : '../apply'}>
          {t(`dashboard-discussions-section.${isMember ? 'no-data-create' : 'no-data-join'}` as const)}
        </Link>
      )}
    </DashboardGenericSection>
  );
};

export default DashboardDiscussionsSection;
