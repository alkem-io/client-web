import React, { FC, memo, useState } from 'react';

import Avatar from '../core/Avatar';
import Card from '../core/Card';
import { Theme } from '../../context/ThemeProvider';
import { Organisation, useOrganizationCardQuery } from '../../generated/graphql';
import { createStyles } from '../../hooks/useTheme';
import hexToRGBA from '../../utils/hexToRGBA';
import OrganizationPopUp from '../Organizations/OrganizationPopUp';
import Loading from '../core/Loading';

interface OrganizationCardStylesProps extends Organisation {
  terms?: Array<string>;
}

const OrganizationCardStyles = createStyles(theme => ({
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

const OrganizationCardInner: FC<OrganizationCardStylesProps> = ({ id, terms }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const styles = OrganizationCardStyles();
  const { data, loading } = useOrganizationCardQuery({
    variables: { id },
  });

  const org = data?.organisation;
  const avatar = org?.profile?.avatar;
  const members = org?.members;

  const tag = (): string => {
    if (!members || members.length === 0) return 'no members';

    if (members.length > 0) return `$members?.length} Member${members && members.length === 1 ? '' : 's'}`;

    return '';
  };

  if (loading) return <Loading text={''} />;

  return (
    <Card
      bodyProps={{
        classes: {
          background: (theme: Theme) => theme.palette.positive,
        },
      }}
      primaryTextProps={{
        text: org?.name || '',
        classes: {
          lineHeight: '36px',
          color: theme => theme.palette.background,
        },
      }}
      className={styles.card}
      matchedTerms={{ terms, variant: 'light' }}
      bgText={{ text: 'Org' }}
      tagProps={{
        text: tag(),
        color: 'background',
        className: styles.tag,
      }}
      onClick={() => {
        !isModalOpened && setIsModalOpened(true);
      }}
    >
      {isModalOpened && org && <OrganizationPopUp id={org?.id} onHide={() => setIsModalOpened(false)} />}
      {avatar && <Avatar size="lg" src={avatar} />}
    </Card>
  );
};

export const OrganizationCard = memo(OrganizationCardInner);
