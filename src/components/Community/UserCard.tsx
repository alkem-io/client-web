import React, { FC, memo } from 'react';

import { Theme } from '../../context/ThemeProvider';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import UserPopUp from './UserPopUp';

import roles from '../../configs/roles.json';
import { User, useUserCardDataQuery } from '../../generated/graphql';
import { createStyles } from '../../hooks/useTheme';
import hexToRGBA from '../../utils/hexToRGBA';

export interface UserCardProps extends User {
  terms?: Array<string>;
}

const userCardStyles = createStyles(theme => ({
  card: {
    transition: 'box-shadow 0.15s ease-in-out',
    '&:hover': {
      boxShadow: `5px 5px 10px ${hexToRGBA(theme.palette.neutral, 0.15)}`,
    },
    border: `1px solid ${hexToRGBA(theme.palette.primary, 0.3)}`,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
}));

const UserCardInner: FC<UserCardProps> = ({ name, terms, id }) => {
  const styles = userCardStyles();
  const { data: userData } = useUserCardDataQuery({
    variables: {
      ids: [id],
    },
  });

  const data = userData?.usersById[0] as User;
  const groups = data?.memberof?.groups.map(g => g.name.toLowerCase());
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
      className={styles.card}
      tagProps={{ text: role }}
      matchedTerms={{ terms }}
      popUp={<UserPopUp terms={[...(terms || [])]} {...data} />}
    >
      <Avatar size="lg" src={data?.profile?.avatar} />
    </Card>
  );
};

export const UserCard = memo(UserCardInner);
