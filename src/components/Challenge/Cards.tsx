import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '../../context/ThemeProvider';
import hexToRGBA from '../../utils/hexToRGBA';
import Button from '../core/Button';
import Card from '../core/Card';
import { useTranslation } from 'react-i18next';

interface OpportunityCardProps {
  displayName?: string;
  url: string;
  lifecycle?: {
    state: string;
  };
  context?: {
    references?: { name: string; uri: string }[];
    visual?: {
      background: string;
    };
  };
}

export const OpportunityCard: FC<OpportunityCardProps> = ({ displayName = '', context, url, lifecycle }) => {
  const { t } = useTranslation();

  const backgroundImg = context?.visual?.background;
  const statusTxt = lifecycle?.state ? `Status: ${lifecycle?.state}` : '';

  return (
    <Card
      classes={{
        background: (theme: Theme) =>
          backgroundImg ? `url("${backgroundImg}") no-repeat center center / cover` : theme.palette.primary,
      }}
      bodyProps={{
        classes: {
          background: (theme: Theme) => hexToRGBA(theme.palette.neutral, 0.7),
        },
      }}
      primaryTextProps={{
        text: displayName,
        classes: {
          color: (theme: Theme) => theme.palette.neutralLight,
        },
      }}
      tagProps={{
        text: statusTxt,
        color: 'background',
      }}
      footerProps={{
        children: (
          <div>
            <Button text={t('buttons.explore')} as={Link} to={url} />
          </div>
        ),
      }}
    />
  );
};
