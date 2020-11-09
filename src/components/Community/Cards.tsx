import React, { FC } from 'react';
import { Theme } from '../../context/ThemeProvider';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import Typography from '../core/Typography';

interface Tag {
  text: string;
}

export interface ProjectCardProps {
  name: string;
  job: string;
  company: string;
  tag?: string;
}

export const PeopleCard: FC<ProjectCardProps> = ({ name, job, company, tag }) => {
  const tagProps = tag
    ? {
        text: tag || '',
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
      <Typography as="p">{job}</Typography>
      <Typography as="p" weight="bold">
        {company}
      </Typography>
      <div className="flex-grow-1"></div>
      <Avatar size="lg" />
    </Card>
  );
};
