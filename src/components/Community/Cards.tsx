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
  memberof: {
    groups: Array<{ name: string }>;
  };
}

export const PeopleCard: FC<ProjectCardProps> = ({ name, ...user }) => {
  const groups = user.memberof?.groups.map(g => g.name);

  const tagProps =
    groups?.includes('global-admins') || groups?.includes('ecoverse-admins')
      ? {
          text: 'admin',
        }
      : undefined;

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
      tagProps={tagProps}
    >
      {/*<Typography as="p">{job}</Typography>
      <Typography as="p" weight="bold">
        {user.email}
      </Typography>*/}
      <div className="flex-grow-1"></div>
      <Avatar size="big" src={user.profile?.avatar} />
    </Card>
  );
};
