import React, { FC } from 'react';
import { Box, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { makeStyles } from '@mui/styles';
import { User } from '../../../../models/graphql-schema';
import Card from '../../../../common/components/core/Card';
import Edit from '@mui/icons-material/Edit';
import { COUNTRIES } from '../../../../models/constants';

export const ContactDetail: FC<{ title: string; value?: string }> = ({ title, value }) => {
  return (
    <>
      {value && (
        <Box>
          <Typography color="primary" fontWeight="bold">
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
            <ContactDetail title="Email" value={email} />
            <ContactDetail title="Bio" value={profile?.description || ''} />
            <ContactDetail title="Phone" value={phone} />
            <ContactDetail title="Country" value={COUNTRIES.find(x => x.code === profile?.location?.country)?.name} />
            <ContactDetail title="City" value={profile?.location?.city} />
          </div>
        </div>
      </Card>
    </>
  );
};
export default ContactDetails;
