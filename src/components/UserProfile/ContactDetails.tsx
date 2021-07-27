import React, { FC } from 'react';
import Typography from '../core/Typography';
import { createStyles } from '../../hooks';
import { User } from '../../types/graphql-schema';
import Card from '../core/Card';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ReactComponent as Edit } from 'bootstrap-icons/icons/pencil-square.svg';

const Detail: FC<{ title: string; value: string }> = ({ title, value }) => {
  return (
    <>
      {value && (
        <>
          <Typography color="primary" weight="boldLight" className={'mt-2'}>
            {title}
          </Typography>
          <Typography>{value}</Typography>{' '}
        </>
      )}
    </>
  );
};

const useContactDetailsStyles = createStyles(theme => ({
  edit: {
    fill: theme.palette.neutral,
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
          <div className={'d-flex align-items-end flex-column'}>
            <OverlayTrigger placement={'bottom'} overlay={<Tooltip id={'Edit profile'}>Edit profile</Tooltip>}>
              <Edit color={'white'} width={20} height={20} className={styles.edit} onClick={onEdit} />
            </OverlayTrigger>
          </div>
          <div className={styles.data}>
            <Detail title="Email" value={email} />
            <Detail title="Bio" value={profile?.description || ''} />
            <Detail title="Phone" value={phone} />
            <Detail title="Country" value={country} />
            <Detail title="City" value={city} />
          </div>
        </div>
      </Card>
    </>
  );
};
export default ContactDetails;
