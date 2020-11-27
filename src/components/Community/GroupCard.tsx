import React, { FC, memo } from 'react';

import Avatar from '../core/Avatar';
import Card from '../core/Card';
import GroupPopUp from './GroupPopUp';

import { Theme } from '../../context/ThemeProvider';
import { useGroupCardQuery, UserGroup } from '../../generated/graphql';
import { createStyles } from '../../hooks/useTheme';
import hexToRGBA from '../../utils/hexToRGBA';
import Typography from '../core/Typography';

interface GroupCardProps extends UserGroup {
  terms?: Array<string>;
}

const groupCardStyles = createStyles(theme => ({
  card: {
    transition: 'box-shadow 0.15s ease-in-out',
    '&:hover': {
      boxShadow: `5px 5px 10px ${hexToRGBA(theme.palette.neutral, 0.15)}`,
    },
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  tag: {
    borderTopRightRadius: 15,
  },
}));

const GroupCardInner: FC<GroupCardProps> = ({ id, terms }) => {
  const styles = groupCardStyles();
  const { data } = useGroupCardQuery({
    variables: {
      id: Number(id),
    },
  });

  const group = data?.group as UserGroup;
  const avatar = group?.profile?.avatar;
  const level = group?.parent?.__typename || '';
  const parentName = group?.parent?.name || '';

  const defaultTags = group?.profile?.tagsets?.find(ts => ts.name === 'default')?.tags;

  const tag = (): string => {
    if (!group?.members || group?.members.length === 0) return 'no members';

    if (group?.members.length > 0)
      return `${group?.members?.length} Member${group?.members && group?.members.length === 1 ? '' : 's'}`;

    return '';
  };

  return (
    <Card
      bodyProps={{
        classes: {
          background: (theme: Theme) => theme.palette.primary,
        },
      }}
      primaryTextProps={{
        text: group?.name || '',
        classes: {
          lineHeight: '36px',
          color: theme => theme.palette.background,
        },
      }}
      level={{ level, name: parentName }}
      className={styles.card}
      tagProps={{ text: tag(), color: 'background', className: styles.tag }}
      matchedTerms={{ terms, variant: 'light' }}
      popUp={<GroupPopUp {...group} terms={[...(terms || [])]} />}
      bgText={{ text: 'group' }}
    >
      <Typography color={'background'}>
        Default tags:{' '}
        {defaultTags?.map(dt => (
          <Typography color={'background'} as={'span'}>
            {dt}
          </Typography>
        ))}
      </Typography>
      {avatar && <Avatar size="lg" src={avatar} />}
    </Card>
  );
};

export const GroupCard = memo(GroupCardInner);
