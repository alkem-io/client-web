import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { Caption } from '../typography';
import { gutters } from '../grid/utils';
import dayjs from 'dayjs';
import { DAYJS_DATEFORMAT } from '@/core/utils/time/utils';
import { useTranslation } from 'react-i18next';

type AuthorshipProps = {
  authorAvatarUri?: string;
  authorName?: string;
  date?: string | Date;
  dateFormat?: string;
};

const Authorship = ({
  authorAvatarUri,
  authorName,
  date,
  dateFormat = DAYJS_DATEFORMAT,
  children,
}: PropsWithChildren<AuthorshipProps>) => {
  const { t } = useTranslation();
  return (
    <Box display="flex" gap={gutters(0.5)}>
      <Box
        component="img"
        src={authorAvatarUri}
        height={gutters()}
        width={gutters()}
        sx={{ background: 'grey' }}
        aria-label={t('common.avatar-of', { user: authorName })}
      />
      <Caption>{children}</Caption>
      {date && <Caption>{dayjs(date).format(dateFormat)}</Caption>}
    </Box>
  );
};

export default Authorship;
