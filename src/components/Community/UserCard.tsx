import React, { FC, memo, useState } from 'react';
import { Theme } from '../../context/ThemeProvider';
import { useUserCardDataQuery } from '../../generated/graphql';
import { createStyles } from '../../hooks/useTheme';
import { User } from '../../types/graphql-schema';
import hexToRGBA from '../../utils/hexToRGBA';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import { Loading } from '../core/Loading';
import UserPopUp from './UserPopUp';

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
  bgText: {
    color: hexToRGBA(theme.palette.neutral, 0.5),
  },
}));

const UserCardInner: FC<UserCardProps> = ({ name, terms, id }) => {
  const [isPopUpShown, setIsModalShown] = useState<boolean>(false);
  const styles = userCardStyles();
  const { data: userData, loading } = useUserCardDataQuery({
    variables: {
      ids: [id],
    },
  });

  const data = userData?.usersById[0] as User;
  // const groups = [] as string[];

  const role = 'Registered';
  // (groups && roles['groups-roles'].find(r => groups.includes(r.group.toLowerCase()))?.role) || roles['default-role'];
  const avatar = data?.profile?.avatar;

  if (loading) return <Loading text={''} />;
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
      bgText={{ text: 'user' }}
      className={styles.card}
      onClick={() => !isPopUpShown && setIsModalShown(true)}
    >
      {avatar && <Avatar size="lg" src={avatar} />}
      {isPopUpShown && <UserPopUp id={data.id} onHide={() => setIsModalShown(false)} terms={terms || []} />}
    </Card>
  );
};

export const UserCard = memo(UserCardInner);
