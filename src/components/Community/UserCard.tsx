import React, { FC, memo } from 'react';

import { Theme } from '../../context/ThemeProvider';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import UserPopUp from './UserPopUp';

import roles from '../../configs/roles.json';
import { User } from '../../generated/graphql';

export interface UserCardProps extends User {
  terms?: Array<string>;
}

const UserCardInner: FC<UserCardProps> = ({ name, terms, ...data }) => {
  const groups = data.memberof?.groups.map(g => g.name.toLowerCase());

  const role =
    (groups && roles['groups-roles'].find(r => groups.includes(r.group.toLowerCase()))?.role) || roles['default-role'];

  return (
    <Card
      bodyProps={{
        classes: {
          background: (theme: Theme) => theme.palette.neutralLight,
        },
      }}
      primaryTextProps={{
        text: name,
        classes: {
          lineHeight: '36px',
        },
      }}
      tagProps={{ text: role }}
      matchedTerms={{ terms }}
      popUp={<UserPopUp name={name} terms={[...(terms || []), 'skills', 'keywords']} {...data} />}
    >
      <Avatar size="lg" src={data.profile?.avatar} />
    </Card>
  );
};

export const UserCard = memo(UserCardInner);
