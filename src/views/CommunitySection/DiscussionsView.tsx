import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Link from '@material-ui/core/Link';
import { createStyles } from '../../hooks';
import { Discussion } from '../../models/discussion/discussion';
import DiscussionOverview from '../../components/composite/entities/Communication/DiscussionOverview';
import { RouterLink } from '../../components/core/RouterLink';
import { useRouteMatch } from 'react-router';
import { buildDiscussionsUrl, buildNewDiscussionUrl } from '../../utils/urlBuilders';

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
  const { url } = useRouteMatch();

  let messagesComponent = (
    <Link component={RouterLink} to={buildNewDiscussionUrl(url)}>
      {t('components.community-section.discussions.no-data')}
    </Link>
  );

  if (discussions && discussions.length > 0) {
    messagesComponent = (
      <>
        {discussions
          .slice(0, DISCUSSIONS_NUMBER_IN_WINDOW)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((x, i) => (
            <DiscussionOverview key={i} discussion={x} />
          ))}
        <Link component={RouterLink} to={buildDiscussionsUrl(url)}>
          {t('components.community-section.discussions.explore')}
        </Link>
      </>
    );
  }

  return <div className={styles.container}>{messagesComponent}</div>;
};
export default DiscussionsView;
