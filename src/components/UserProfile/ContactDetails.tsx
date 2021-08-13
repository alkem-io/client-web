import React, { FC } from 'react';
import Typography from '../core/Typography';
import { createStyles } from '../../hooks/useTheme';
import { User } from '../../models/graphql-schema';
import Card from '../core/Card';
import { ReactComponent as Edit } from 'bootstrap-icons/icons/pencil-square.svg';
import Tooltip from '@material-ui/core/Tooltip';
import { COUNTRIES } from '../../models/constants';
import { Box } from '@material-ui/core';

const Detail: FC<{ title: string; value?: string }> = ({ title, value }) => {
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
                <Edit color={'white'} width={20} height={20} className={styles.edit} onClick={onEdit} />
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
