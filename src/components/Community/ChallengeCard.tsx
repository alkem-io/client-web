import React, { FC, memo, useState } from 'react';

import Card from '../core/Card';
import { Theme } from '../../context/ThemeProvider';
import { Challenge } from '../../types/graphql-schema';
import { createStyles } from '../../hooks';
import hexToRGBA from '../../utils/hexToRGBA';
import Loading from '../core/Loading';
import { useChallengeCardQuery } from '../../generated/graphql';
import ChallengePopUp from '../Challenge/ChallengePopUp';
import { Activities } from '../ActivityPanel';
import getActivityCount from '../../utils/get-activity-count';

interface ChallengeCardStylesProps extends Challenge {
  terms?: Array<string>;
}

const ChallengeCardStyles = createStyles(theme => ({
  card: {
    transition: 'box-shadow 0.15s ease-in-out',
    border: `1px solid ${theme.palette.neutralMedium}`,

    '&:hover': {
      boxShadow: `5px 5px 10px ${hexToRGBA(theme.palette.neutral, 0.15)}`,
    },
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  tag: {
    borderTopRightRadius: 15,
  },
  content: {
    height: 130,
    background: theme.palette.background,
    padding: theme.shape.spacing(2),
  },
  relative: {
    position: 'relative',
  },
}));

const ChallengeCardInner: FC<ChallengeCardStylesProps> = ({ id, terms, ecoverseID }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const styles = ChallengeCardStyles();
  const { data, loading } = useChallengeCardQuery({
    variables: { ecoverseId: ecoverseID, challengeId: id },
  });

  const ecoverseName = data?.ecoverse?.nameID;
  const challenge = data?.ecoverse?.challenge;
  const backgroundImg = challenge?.context?.visual?.background;
  const activity = challenge?.activity || [];

  if (loading) return <Loading text={''} />;

  return (
    <div className={styles.relative}>
      <Card
        className={styles.card}
        classes={{
          background: (theme: Theme) =>
            backgroundImg ? `url("${backgroundImg}") no-repeat center center / cover` : theme.palette.neutral,
        }}
        bodyProps={{
          classes: {
            background: (theme: Theme) => hexToRGBA(theme.palette.neutral, 0.7),
            padding: (theme: Theme) =>
              `${theme.shape.spacing(4)}px ${theme.shape.spacing(3)}px ${theme.shape.spacing(1)}px`,
          },
        }}
        primaryTextProps={{
          text: challenge?.displayName || '',
          classes: {
            color: theme => theme.palette.background,
          },
        }}
        sectionProps={{
          children: (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Activities
                items={[
                  { name: 'Opportunities', digit: getActivityCount(activity, 'opportunities') || 0, color: 'primary' },
                  { name: 'Members', digit: getActivityCount(activity, 'members') || 0, color: 'positive' },
                ]}
              />
            </div>
          ),
          className: styles.content,
        }}
        matchedTerms={{ terms }}
        tagProps={{
          text: `${ecoverseName}`,
          color: 'background',
          className: styles.tag,
        }}
        onClick={() => {
          !isModalOpened && setIsModalOpened(true);
        }}
      >
        {isModalOpened && challenge && (
          <ChallengePopUp
            id={challenge?.id}
            ecoverseId={challenge?.ecoverseID}
            onHide={() => setIsModalOpened(false)}
          />
        )}
      </Card>
    </div>
  );
};

export const ChallengeCard = memo(ChallengeCardInner);
