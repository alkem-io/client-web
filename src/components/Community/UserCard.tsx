import React, { FC } from 'react';

import { Theme } from '../../context/ThemeProvider';
import Avatar from '../core/Avatar';
import Card from '../core/Card';

import { UserModel } from '../../models/User';
import roles from '../../configs/roles.json';
import UserPopUp from './UserPopUp';
import { User } from '../../generated/graphql';

export interface UserCardProps extends UserModel {
  __typename: string;
  terms?: Array<string>;
  memberof?: {
    groups: Array<{ name: string }>;
    challenges?: Array<{ name: string }>;
    organisations?: Array<{ name: string }>;
  };
}

export const UserCard: FC<UserCardProps> = ({ name, terms, ...data }) => {
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
      popUp={<UserPopUp name={name} {...data} />}
    >
      <Avatar size="lg" src={data.profile?.avatar} />
    </Card>
  );
};
