import React, { FC, memo, useMemo, useState } from 'react';
import { createStyles } from '../../../hooks/useTheme';
import { useUserMetadata } from '../../../hooks';
import { User } from '../../../models/graphql-schema';
import hexToRGBA from '../../../utils/hexToRGBA';
import Avatar from '../../core/Avatar';
import Card from '../../core/Card';
import { Loading } from '../../core';
import UserPopUp from '../dialogs/UserPopUp';
import Tag from '../../core/Tag';
import TagContainer from '../../core/TagContainer';
import Tooltip from '@mui/material/Tooltip';

export interface UserCardProps extends User {
  terms?: Array<string>;
}

const userCardStyles = createStyles(theme => ({
  card: {
    transition: 'box-shadow 0.15s ease-in-out',
    '&:hover': {
      boxShadow: `5px 5px 10px ${hexToRGBA(theme.palette.neutral.main, 0.15)}`,
    },
    border: `1px solid ${hexToRGBA(theme.palette.primary.main, 0.3)}`,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  bgText: {
    color: hexToRGBA(theme.palette.neutral.main, 0.5),
  },
  relative: {
    position: 'relative',
  },
  divCentered: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  section: {
    padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
  },
}));

const UserCardInner: FC<UserCardProps> = ({ displayName, terms, id }) => {
  const [isPopUpShown, setIsModalShown] = useState<boolean>(false);
  const styles = userCardStyles();

  const { user: userMetadata, loading } = useUserMetadata(id);

  const roleName = userMetadata?.roles[0]?.name;
  const tagProps = userMetadata?.roles[0]?.hidden ? undefined : { text: roleName };

  const tags = userMetadata?.user?.profile?.tagsets?.flatMap(x => x.tags) || [];
  const truncatedTags = useMemo(() => tags.slice(0, 3), [tags]);

  const avatar = userMetadata?.user.profile?.avatar;

  if (loading) return <Loading text={''} />;
  return (
    <div className={styles.relative}>
      <Card
        className={styles.card}
        bodyProps={{
          classes: {
            background: theme => theme.palette.background.paper,
            padding: theme => `${theme.spacing(4)} ${theme.spacing(3)} ${theme.spacing(1)}`,
          },
        }}
        primaryTextProps={{
          text: (
            <div className={styles.divCentered}>
              {avatar && <Avatar size="md" src={avatar} />}
              {displayName}
            </div>
          ),
        }}
        sectionProps={{
          children: (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TagContainer>
                {truncatedTags.map((t, i) => (
                  <Tag key={i} text={t} color="neutralMedium" />
                ))}
                {tags.length > 3 && (
                  <Tooltip placement="right" title={tags.slice(3).join(', ')} id="more-tags">
                    <span>
                      <Tag text={<>{`+ ${tags.length - truncatedTags.length} more`}</>} color="neutralMedium" />
                    </span>
                  </Tooltip>
                )}
              </TagContainer>
            </div>
          ),
          className: styles.section,
        }}
        tagProps={tagProps}
        matchedTerms={{ terms }}
        onClick={() => !isPopUpShown && setIsModalShown(true)}
      >
        {isPopUpShown && <UserPopUp id={id} onHide={() => setIsModalShown(false)} terms={terms || []} />}
      </Card>
    </div>
  );
};

export const UserCard = memo(UserCardInner);
