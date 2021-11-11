import React, { FC, memo, ReactElement, useState } from 'react';
import { default as CoreCard } from '../../core/Card';
import { createStyles } from '../../../hooks/useTheme';
import hexToRGBA from '../../../utils/hexToRGBA';
import { Activities, ActivityItem } from '../common/ActivityPanel/Activities';

const getStyles = createStyles(theme => ({
  card: {
    transition: 'box-shadow 0.15s ease-in-out',
    border: `1px solid ${theme.palette.neutralMedium.main}`,

    '&:hover': {
      boxShadow: `5px 5px 10px ${hexToRGBA(theme.palette.neutral.main, 0.15)}`,
    },
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  content: {
    height: 130,
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
  },
  relative: {
    position: 'relative',
  },
}));

interface Props {
  terms: Array<string>;
  activity: ActivityItem[];
  title: string;
  backgroundImg: string;
  tag: string;
  dialog: ReactElement;
}

const SearchCardInner: FC<Props> = ({ terms, activity, title, backgroundImg, tag, dialog }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const styles = getStyles();

  const hideHandler = () => setIsModalOpened(false);
  const dialogWithHandlers = React.cloneElement(dialog, { onHide: hideHandler });

  return (
    <div className={styles.relative}>
      <CoreCard
        className={styles.card}
        classes={{
          background: theme =>
            backgroundImg ? `url("${backgroundImg}") no-repeat center center / cover` : theme.palette.neutral.main,
        }}
        bodyProps={{
          classes: {
            background: theme => hexToRGBA(theme.palette.neutral.main, 0.7),
            padding: theme => `${theme.spacing(4)} ${theme.spacing(3)} ${theme.spacing(1)}`,
          },
        }}
        primaryTextProps={{
          text: title,
          classes: {
            color: theme => theme.palette.background.paper,
          },
        }}
        sectionProps={{
          children: (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Activities items={activity} />
            </div>
          ),
          className: styles.content,
        }}
        matchedTerms={{ terms }}
        tagProps={{ text: tag }}
        onClick={() => !isModalOpened && setIsModalOpened(true)}
      >
        {isModalOpened && dialogWithHandlers}
      </CoreCard>
    </div>
  );
};

export const SearchCard = memo(SearchCardInner);
