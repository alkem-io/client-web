import React, { FC } from 'react';
import { Theme } from '../../context/ThemeProvider';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import GroupPopUp from './GroupPopUp';
import { User } from '../../generated/graphql';

export interface GroupCardProps {
  __typename: string;
  name: string;
  members?: Array<User>;
  profile?: {
    avatar: string;
  };
}

export const GroupCard: FC<GroupCardProps> = ({ name, members, __typename, ...data }) => {
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
