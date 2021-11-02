import { List } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from '../../components/Admin/Common/Filter';
import ProfileCard from '../../components/composite/common/cards/ProfileCard/ProfileCard';
import DiscussionOverview from '../../components/composite/entities/Communication/DiscussionOverview';

export const DiscussionListView: FC = () => {
  const { t } = useTranslation();
  const data = [
    {
      id: '1',
      title: 'Discussion subject title',
      description:
        'Discussion information to be placed here. In approximately two to three sentences, this is an even long sentence. Another one been added!',
      date: new Date('2021-10-18'),
      avatars: [
        { name: 'A', src: '' },
        { name: 'B', src: '' },
        { name: 'C', src: '' },
        { name: 'D', src: '' },
      ],
      count: 43,
    },
    {
      id: '2',
      title: 'Discussion subject title',
      description:
        'Discussion information to be placed here. In approximately two to three sentences, this is an even long sentence. Another one been added!',
      date: new Date('2021-10-17'),
      avatars: [
        { name: 'A', src: '' },
        { name: 'D', src: '' },
      ],
      count: 1,
    },
    {
      id: '3',
      title: 'Discussion subject title',
      description:
        'Discussion information to be placed here. In approximately two to three sentences, this is an even long sentence. Another one been added!',
      date: new Date('2021-10-19'),
      avatars: [
        { name: 'A', src: '' },
        { name: 'B', src: '' },
        { name: 'C', src: '' },
        { name: 'D', src: '' },
      ],
      count: 43,
    },
    {
      id: '4',
      title: 'Discussion subject title',
      description:
        'Discussion information to be placed here. In approximately two to three sentences, this is an even long sentence. Another one been added!',
      date: new Date('2021-10-19'),
      avatars: [
        { name: 'A', src: '' },
        { name: 'B', src: '' },
        { name: 'C', src: '' },
        { name: 'D', src: '' },
      ],
      count: 43,
    },
  ];

  return (
    <ProfileCard title={t('common.discussions')} helpText={t('components.discussions-list.help')}>
      <Filter data={data} sort={[{ key: 'date', name: 'Date' }]}>
        {filteredData => (
          <List>
            {filteredData.map((item, index) => (
              <DiscussionOverview key={index} {...item} />
            ))}
          </List>
        )}
      </Filter>
    </ProfileCard>
  );
};
