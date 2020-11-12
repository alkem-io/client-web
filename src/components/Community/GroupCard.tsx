import React, { FC, memo } from 'react';

import Avatar from '../core/Avatar';
import Card from '../core/Card';
import GroupPopUp from './GroupPopUp';

import { Theme } from '../../context/ThemeProvider';
import { UserGroup } from '../../generated/graphql';

const GroupCardInner: FC<UserGroup> = ({ name, members, __typename, ...data }) => {
  const tag = `${members?.length} Member${members && members.length > 1 ? 's' : ''}`;

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
      tagProps={{ text: tag, color: 'primary' }}
      popUp={<GroupPopUp name={name} members={members} {...data} />}
    >
      <Avatar size="lg" src={data.profile?.avatar} theme={'light'} />
    </Card>
  );
};

export const GroupCard = memo(GroupCardInner);
