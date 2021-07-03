import React, { FC, memo, useState } from 'react';

import Avatar from '../core/Avatar';
import Card from '../core/Card';
import { Theme } from '../../context/ThemeProvider';
import { Challenge } from '../../types/graphql-schema';
import { createStyles } from '../../hooks/useTheme';
import hexToRGBA from '../../utils/hexToRGBA';
import OrganizationPopUp from '../Organizations/OrganizationPopUp';
import Loading from '../core/Loading';
import { useChallengeCardQuery } from '../../generated/graphql';

interface ChallengeCardStylesProps extends Challenge {
  terms?: Array<string>;
}

const ChallengeCardStyles = createStyles(theme => ({
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

const ChallengeCardInner: FC<ChallengeCardStylesProps> = ({ id, terms, ecoverseID }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const styles = ChallengeCardStyles();
  const { data, loading } = useChallengeCardQuery({
    variables: { ecoverseId: ecoverseID, challengeId: id },
  });

  const challenge = data?.ecoverse?.challenge;
  const avatar = challenge?.context?.visual?.avatar;

  const tag = (): string => {
    // todo: get this from activity
    return '7 members';
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
        text: challenge?.displayName || '',
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
      {isModalOpened && challenge && <OrganizationPopUp id={challenge?.id} onHide={() => setIsModalOpened(false)} />}
      {avatar && <Avatar size="lg" src={avatar} />}
    </Card>
  );
};

export const ChallengeCard = memo(ChallengeCardInner);
