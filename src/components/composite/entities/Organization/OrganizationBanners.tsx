import { Link } from '@mui/material';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { OrganizationDetailsFragment } from '../../../../models/graphql-schema';
import { buildOrganizationUrl } from '../../../../utils/urlBuilders';
import Typography from '../../../core/Typography';
import Image from '../../../core/Image';
import OrganizationPopUp from './OrganizationPopUp';

const useOrganizationStyles = makeStyles(theme => ({
  organizationWrapper: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  column: {
    flexDirection: 'column',
  },
  imgContainer: {
    display: 'flex',
    flex: '0 45%',
    width: '100%',
    margin: '0 auto',
  },
  img: {
    height: 'initial',
    maxWidth: '100%',
    maxHeight: 150,
    margin: '0 auto',
    objectFit: 'contain',
  },
  link: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(4),
  },
}));

interface Props {
  organizations: OrganizationDetailsFragment[];
}

export const OrganizationBanners: FC<Props> = ({ organizations }) => {
  const { t } = useTranslation();
  const styles = useOrganizationStyles();
  const [modalId, setModalId] = useState<string | null>(null);

  return (
    <>
      <div className={clsx(styles.organizationWrapper, organizations.length === 2 && styles.column)}>
        {organizations.map((org, index) => {
          if (index > 4) return null;
          return (
            <Tooltip placement="bottom" id={`challenge-${org.id}-tooltip`} title={org.displayName} key={index}>
              <div className={styles.imgContainer}>
                <Link component={RouterLink} to={buildOrganizationUrl(org.nameID)}>
                  <Image src={org.profile?.avatar?.uri} alt={org.displayName} className={styles.img} />
                </Link>
              </div>
            </Tooltip>
          );
        })}
      </div>

      {!!modalId && <OrganizationPopUp id={modalId} onHide={() => setModalId(null)} />}

      {organizations.length > 4 && (
        <Tooltip
          placement="bottom"
          id="challenge-rest-tooltip"
          title={organizations.map(x => x.displayName).join(', ')}
        >
          <Box display={'flex'}>
            <Typography variant="h3">{t('pages.challenge.organizationBanner.load-more')}</Typography>
          </Box>
        </Tooltip>
      )}
    </>
  );
};
