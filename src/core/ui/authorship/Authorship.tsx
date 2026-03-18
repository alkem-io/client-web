import { Box } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import ContributorTooltip from '@/domain/community/contributor/ContributorTooltip/ContributorTooltip';
import FormattedDate from '../date/FormattedDate';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

type AuthorshipProps = {
  author:
    | {
        id: string;
        profile?: {
          displayName: string;
          avatar?: {
            uri: string | undefined;
          };
        };
      }
    | undefined;
  date?: string | Date | undefined;
  component?: React.ElementType;
};

const Authorship = ({ author, date, component: Component = Caption, children }: PropsWithChildren<AuthorshipProps>) => {
  const { t } = useTranslation();
  if (!author) {
    return null;
  }
  return (
    <Box display="flex" gap={gutters(0.5)}>
      <ContributorTooltip contributorId={author.id} contributorType={ActorType.User}>
        <Box display="flex" gap={gutters(0.5)}>
          {author?.profile?.avatar?.uri && (
            <Box
              component="img"
              src={author?.profile?.avatar?.uri}
              height={gutters()}
              width={gutters()}
              sx={{ background: 'grey' }}
              aria-label={t('common.avatar-of', { user: author?.profile?.displayName })}
              role="img"
            />
          )}
          <Component style={{ cursor: 'default', whiteSpace: 'nowrap' }}>{author.profile?.displayName}</Component>
        </Box>
      </ContributorTooltip>
      {author.profile?.displayName && date && ' · '}
      <FormattedDate date={date} component={Component} />
      <Component>{children}</Component>
    </Box>
  );
};

export default Authorship;
