import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '../../context/ThemeProvider';
import { Opportunity } from '../../types/graphql-schema';
import hexToRGBA from '../../utils/hexToRGBA';
import Button from '../core/Button';
import Card from '../core/Card';

interface OpportunityCardProps extends Opportunity {
  url: string;
}

export const OpportunityCard: FC<OpportunityCardProps> = ({ name, context, url, lifecycle }) => {
  const { references } = context || {};
  const visual = references?.find(x => x.name === 'poster');

  let statusTxt = '';
  if (lifecycle?.state) statusTxt = `Status: ${lifecycle?.state}`;

  return (
    <Card
      classes={{
        background: (theme: Theme) =>
          visual ? `url("${visual.uri}") no-repeat center center / cover` : theme.palette.primary,
      }}
      bodyProps={{
        classes: {
          background: (theme: Theme) => hexToRGBA(theme.palette.neutral, 0.7),
        },
      }}
      primaryTextProps={{
        text: name,
        classes: {
          color: (theme: Theme) => theme.palette.neutralLight,
        },
      }}
      tagProps={{
        text: statusTxt,
        color: 'background',
      }}
    >
      <div className="flex-grow-1"></div>
      <div>
        <Button text="Details" as={Link} to={url} />
      </div>
    </Card>
  );
};
