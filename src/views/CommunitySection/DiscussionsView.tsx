import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';
import { createStyles } from '../../hooks';
import { Discussion } from '../../models/discussion/discussion';
import DiscussionOverview from '../../components/composite/entities/Communication/DiscussionOverview';

const DISCUSSIONS_NUMBER_IN_WINDOW = 3;

const useDiscussionsStyles = createStyles(_theme => ({
  container: {
    maxHeight: '480px',
    overflow: 'auto',
    paddingRight: '15px',
  },
}));
interface DiscussionsProps {
  discussions?: Discussion[];
}

export const DiscussionsView: FC<DiscussionsProps> = ({ discussions }) => {
  const { t } = useTranslation();
  const styles = useDiscussionsStyles();

  let messagesComponent = <Typography>{t('common.no-discussions')}</Typography>;

  if (discussions && discussions.length > 0) {
    messagesComponent = (
      <>
        {discussions
          .slice(0, DISCUSSIONS_NUMBER_IN_WINDOW)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((x, i) => (
            <DiscussionOverview key={i} discussion={x} />
          ))}
      </>
    );
  }

  return <div className={styles.container}>{messagesComponent}</div>;
};
export default DiscussionsView;
