import React, { FC, memo } from 'react';

import Avatar from '../core/Avatar';
import Card from '../core/Card';
import GroupPopUp from './GroupPopUp';

import { Theme } from '../../context/ThemeProvider';
import { useGroupCardQuery, UserGroup } from '../../generated/graphql';

const GroupCardInner: FC<UserGroup> = ({ id }) => {
  const { data } = useGroupCardQuery({
    variables: {
      id: Number(id),
    },
  });

  const group = data?.group as UserGroup;

  const tag = (): string => {
    if (!group?.members || group?.members.length === 0) return 'no members';

    if (group?.members.length > 0)
      return `${group?.members?.length} Member${group?.members && group?.members.length === 1 ? '' : 's'}`;

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
        text: group?.name || '',
        classes: {
          lineHeight: '36px',
        },
      }}
      tagProps={{ text: tag(), color: 'primary' }}
      popUp={<GroupPopUp {...group} />}
    >
      <Avatar size="lg" src={group?.profile?.avatar} theme={'light'} />
    </Card>
  );
};

export const GroupCard = memo(GroupCardInner);
