import React, { FC } from 'react';
import { Box } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { createStyles } from '../../../../hooks/useTheme';
import { User } from '../../../../models/graphql-schema';
import Card from '../../../core/Card';
import { ReactComponent as Edit } from 'bootstrap-icons/icons/pencil-square.svg';
import { COUNTRIES } from '../../../../models/constants';
import Typography from '../../../core/Typography';

export const Detail: FC<{ title: string; value?: string }> = ({ title, value }) => {
  return (
    <>
      {value && (
        <Box marginY={1}>
          <Typography color="primary" weight="boldLight">
            {title}
          </Typography>
          <Typography>{value}</Typography>
        </Box>
      )}
    </>
  );
};

const useContactDetailsStyles = createStyles(theme => ({
  edit: {
    fill: theme.palette.neutral.main,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  rows: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  data: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,

    '& > div': {
      marginTop: 0,
    },
  },
}));

const ContactDetails: FC<{ user: User; onEdit?: () => void }> = ({
  user: { country, city, email, phone, profile },
  onEdit,
}) => {
  const styles = useContactDetailsStyles();
  return (
    <>
      <Card>
        <div className={styles.rows}>
          <Box display={'flex'} alignItems={'end'} flexDirection={'column'}>
            <Tooltip placement={'bottom'} id={'Edit profile'} title={'Edit profile'}>
              <span>
                {onEdit && (
                  <IconButton aria-label="Edit" size="small" onClick={onEdit}>
                    <Edit />
                  </IconButton>
                )}
              </span>
            </Tooltip>
          </Box>
          <div className={styles.data}>
            <Detail title="Email" value={email} />
            <Detail title="Bio" value={profile?.description || ''} />
            <Detail title="Phone" value={phone} />
            <Detail title="Country" value={COUNTRIES.find(x => x.code === country)?.name} />
            <Detail title="City" value={city} />
          </div>
        </div>
      </Card>
    </>
  );
};
export default ContactDetails;
