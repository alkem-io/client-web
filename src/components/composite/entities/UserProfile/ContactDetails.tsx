import React, { FC } from 'react';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { makeStyles } from '@mui/styles';
import { User } from '../../../../models/graphql-schema';
import Card from '../../../core/Card';
import Edit from '@mui/icons-material/Edit';
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

const useContactDetailsStyles = makeStyles(theme => ({
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

const ContactDetails: FC<{ user: User; onEdit?: () => void }> = ({ user: { email, phone, profile }, onEdit }) => {
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
            <Detail title="Country" value={COUNTRIES.find(x => x.code === profile?.location?.country)?.name} />
            <Detail title="City" value={profile?.location?.city} />
          </div>
        </div>
      </Card>
    </>
  );
};
export default ContactDetails;
