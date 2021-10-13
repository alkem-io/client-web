import React, { FC } from 'react';
import Chip from '@material-ui/core/Chip';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles(theme => ({
  tagMargin: {
    marginRight: theme.spacing(0.2),
    marginBottom: theme.spacing(0.2),
  },
  tagWrapper: {
    display: 'flex',
    gap: theme.spacing(0.3),
    flexWrap: 'wrap',
  },
}));

interface Props {
  tags: string[];
  count: number;
  className: any;
}
//  todo move in diff dir
const TagsComponent: FC<Props> = ({ tags, count, className }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const tagsToDisplay = tags.slice(0, count);
  const moreTags = tags.slice(count);
  const moreTagsText = moreTags.length ? t('components.tags-component.more', { count: moreTags.length }) : '';
  const moreTagsTooltipTitle = moreTags.join(',');

  return (
    <div className={className}>
      {/*div instead of Box because can't manipulate flexGap*/}
      <div className={styles.tagWrapper}>
        {tagsToDisplay.map((x, i) => (
          <Chip
            key={i}
            label={x}
            variant="outlined"
            color="primary"
            size="small"
            icon={<FiberManualRecordIcon />}
            className={styles.tagMargin}
          />
        ))}
        {moreTags.length > 0 && (
          <Tooltip title={moreTagsTooltipTitle} arrow placement={'right'}>
            <Chip
              label={moreTagsText}
              variant="outlined"
              color="primary"
              size="small"
              icon={<FiberManualRecordIcon />}
              className={styles.tagMargin}
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
};
export default TagsComponent;
