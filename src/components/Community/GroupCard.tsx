import React, { FC, memo } from 'react';

import Avatar from '../core/Avatar';
import Card from '../core/Card';
import GroupPopUp from './GroupPopUp';

import { Theme } from '../../context/ThemeProvider';
import { UserGroup } from '../../generated/graphql';
import { QUERY_GROUP_CARD } from '../../graphql/community';
import { useQuery } from '@apollo/client';

const GroupCardInner: FC<UserGroup> = ({ name, __typename, id }) => {
  const { data: groupData } = useQuery(QUERY_GROUP_CARD, {
    variables: {
      id: Number(id),
    },
  });

  const data = groupData?.group;

  const tag = (): string => {
    if (!data?.members || data?.members.length === 0) return 'no members';

    if (data?.members.length > 0)
      return `${data?.members?.length} Member${data?.members && data?.members.length === 1 ? '' : 's'}`;

    return '';
  };

  return (
    <Card
      bodyProps={{
        classes: {
          background: (theme: Theme) => theme.palette.neutralMedium,
        },
      }}
      primaryTextProps={{
        text: name,
        classes: {
          lineHeight: '36px',
        },
      }}
      tagProps={{ text: tag(), color: 'primary' }}
      popUp={<GroupPopUp name={name} {...data} />}
    >
      <Avatar size="lg" src={data?.profile?.avatar} theme={'light'} />
    </Card>
  );
};

export const GroupCard = memo(GroupCardInner);
