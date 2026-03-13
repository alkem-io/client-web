import { DialogContent } from '@mui/material';
import { Trans } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import Loading from '@/core/ui/loading/Loading';
import { Caption } from '@/core/ui/typography';
import { useCreateSpaceLink } from '../useCreateSpaceLink/useCreateSpaceLink';
import { ExpandableSpaceTree } from './ExpandableSpaceTree';
import type { MyMembershipsDialogProps } from './MyMembershipsDialog.model';

export const MyMembershipsDialog = ({
  data,
  open,
  Icon,
  title,
  loading,
  showFooterText = true,
  onClose,
}: MyMembershipsDialogProps) => {
  const { link: createSpaceLink } = useCreateSpaceLink();

  return (
    <DialogWithGrid columns={8} open={open} onClose={onClose} aria-labelledby="my-memberships-dialog">
      <DialogHeader id="my-memberships-dialog" icon={Icon ? <Icon /> : undefined} title={title} onClose={onClose} />

      <DialogContent style={{ paddingTop: 0 }}>
        {loading && <Loading />}

        <Gutters disableGap={true} disablePadding={true}>
          {data?.map(spaceMembership => (
            <ExpandableSpaceTree key={spaceMembership.space.id} membership={spaceMembership} />
          ))}

          <Caption alignSelf="center" paddingTop={gutters(0.5)}>
            {showFooterText && (
              <Trans
                i18nKey="pages.home.sections.myMemberships.seeMore"
                components={{
                  spaces: <RouterLink to="/spaces" underline="always" />,
                  landing: <RouterLink to={createSpaceLink} underline="always" />,
                }}
              />
            )}
          </Caption>
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};
