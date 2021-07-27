import React, { FC, memo, useState } from 'react';
import { Theme } from '../../context/ThemeProvider';
import { useGroupCardQuery } from '../generated/graphql';
import { useEcoverse } from '../../hooks';
import { createStyles } from '../../hooks/useTheme';
import { UserGroup } from '../../models/graphql-schema';
import hexToRGBA from '../../utils/hexToRGBA';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import { Loading } from '../core/Loading';
import Typography from '../core/Typography';
import GroupPopUp from './GroupPopUp';
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
  const [isPopUpShown, setIsModalShown] = useState<boolean>(false);
  const { ecoverseId } = useEcoverse();

  const styles = groupCardStyles();
  const { data, loading } = useGroupCardQuery({
    variables: {
      ecoverseId,
      groupId: id,
    },
  });

  const group = data?.ecoverse?.group as UserGroup;
  const avatar = group?.profile?.avatar;
  const level = data?.ecoverse?.group?.parent?.__typename || '';
  const parentName = data?.ecoverse?.group?.parent?.displayName || '';

  const defaultTags = group?.profile?.tagsets?.find(ts => ts.name === 'default')?.tags;

  const tag = (): string => {
    if (!group?.members || group?.members.length === 0) return 'no members';

    if (group?.members.length > 0)
      return `${group?.members?.length} Member${group?.members && group?.members.length === 1 ? '' : 's'}`;

    return '';
  };

  if (loading) return <Loading text={''} />;

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
      bgText={{ text: 'group' }}
      onClick={() => !isPopUpShown && setIsModalShown(true)}
    >
      {defaultTags && defaultTags.length > 0 && (
        <Typography color={'background'}>
          Tags:{' '}
          {defaultTags?.map(dt => (
            <Typography color={'background'} as={'span'}>
              {dt}
            </Typography>
          ))}
        </Typography>
      )}
      {avatar && <Avatar size="lg" src={avatar} />}
      {isPopUpShown && <GroupPopUp {...group} onHide={() => setIsModalShown(false)} terms={terms || []} />}
    </Card>
  );
};

export const GroupCard = memo(GroupCardInner);
