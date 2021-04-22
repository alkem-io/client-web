import React, { FC } from 'react';
import { Theme } from '../../context/ThemeProvider';
import Card from '../core/Card';
import { Spacer } from '../shared/Spacer';

export const ContentCard: FC<{ title: string }> = ({ title, children }) => {
  return (
    <Card
      bodyProps={{
        classes: {
          background: (theme: Theme) => theme.palette.neutralLight,
        },
      }}
      primaryTextProps={{ text: title }}
    >
      <Spacer />
      {children}
    </Card>
  );
};
