import React, { FC } from 'react';
import Card from '../../../core/Card';
import { Spacer } from '../../../core/Spacer';

export const ContentCard: FC<{ title: string }> = ({ title, children }) => {
  return (
    <Card
      bodyProps={{
        classes: {
          background: theme => theme.palette.neutralLight.main,
        },
      }}
      primaryTextProps={{ text: title }}
    >
      <Spacer />
      {children}
    </Card>
  );
};
