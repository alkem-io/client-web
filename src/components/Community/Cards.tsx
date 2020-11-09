import React, { FC } from 'react';
import { Theme } from '../../context/ThemeProvider';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import Typography from '../core/Typography';
import { UserModel } from '../../models/User';

interface Tag {
  text: string;
}

export interface ProjectCardProps extends UserModel {
  __typename: string;
  memberof: {
    groups: Array<{ name: string }>;
  };
}

export const PeopleCard: FC<ProjectCardProps> = ({ name, __typename, ...data }) => {
  const groups = data.memberof?.groups.map(g => g.name);

  const tagProps = () => {
    if (__typename === 'UserGroup') return { text: 'Group' };
    if (groups?.includes('global-admins') || groups?.includes('ecoverse-admins')) {
      return { text: 'admin' };
    }
    return undefined;
  };

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
      tagProps={tagProps()}
    >
      {/*<Typography as="p">{job}</Typography>
      <Typography as="p" weight="bold">
        {user.email}
      </Typography>*/}
      <div className="flex-grow-1"></div>
      <Avatar size="big" src={data.profile?.avatar} />
    </Card>
  );
};
