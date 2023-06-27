import React, { FC, ReactElement } from 'react';
import { Box, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { makeStyles } from '@mui/styles';
import { User } from '../../../../core/apollo/generated/graphql-schema';
import Card from '../../../../common/components/core/Card';
import Edit from '@mui/icons-material/Edit';
import { COUNTRIES } from '../../../common/location/countries.constants';
import { useTranslation } from 'react-i18next';

interface ContactDetailProps {
  title: string;
  icon?: ReactElement;
  value?: string;
}

export const ContactDetail: FC<ContactDetailProps> = ({ title, icon, value }) => {
  return (
    <>
      {value &&
        (icon ? (
          <Box title={title} sx={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Typography>{value}</Typography>
          </Box>
        ) : (
          <Box>
            <Typography color="primary" fontWeight="bold">
              {title}
            </Typography>
            <Typography>{value}</Typography>
          </Box>
        ))}
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
  const { t } = useTranslation();

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
            <ContactDetail title={t('common.email')} value={email} />
            <ContactDetail title={t('components.profile.fields.bio.title')} value={profile.description || ''} />
            <ContactDetail title={t('components.profile.fields.phone.title')} value={phone} />
            <ContactDetail
              title={t('components.profileSegment.location.country.name')}
              value={COUNTRIES.find(x => x.code === profile.location?.country)?.name}
            />
            <ContactDetail title={t('components.profileSegment.location.city.name')} value={profile.location?.city} />
          </div>
        </div>
      </Card>
    </>
  );
};

export default ContactDetails;
