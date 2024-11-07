import { ReactElement, JSXElementConstructor } from 'react';

import { Trans } from 'react-i18next';
import { SvgIconProps, DialogContent } from '@mui/material';

import Gutters from '../../../../core/ui/grid/Gutters';
import { Caption } from '../../../../core/ui/typography';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';

import Loading from '../../../../core/ui/loading/Loading';
import { ExpandableSpaceTree } from './ExpandableSpaceTree';
import RouterLink from '../../../../core/ui/link/RouterLink';

import { gutters } from '../../../../core/ui/grid/utils';
import { useCreateSpaceLink } from '../useCreateSpaceLink/useCreateSpaceLink';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]; // TODO:p Find (create if doesn't exist) type for this.
  title: string;
  open: boolean;
  loading: boolean;
  onClose: () => void;

  showFooterText?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon?: ReactElement<SvgIconProps, string | JSXElementConstructor<any>>;
};

export const MyMembershipsDialog = ({ data, open, Icon, title, loading, showFooterText = true, onClose }: Props) => {
  const { link: createSpaceLink } = useCreateSpaceLink();

  return (
    <DialogWithGrid columns={8} open={open} onClose={onClose}>
      <DialogHeader icon={Icon} title={title} onClose={onClose} />

      <DialogContent style={{ paddingTop: 0 }}>
        {loading && <Loading />}

        <Gutters disableGap disablePadding>
          {data?.map(spaceMembership => (
            <ExpandableSpaceTree key={spaceMembership.id} membership={spaceMembership} />
          ))}

          <Caption alignSelf="center" paddingTop={gutters(0.5)}>
            {showFooterText && (
              <Trans
                i18nKey="pages.home.sections.myMemberships.seeMore"
                components={{
                  spaces: <RouterLink to="/spaces" underline="always" />,
                  landing: <RouterLink to={createSpaceLink ?? ''} underline="always" />,
                }}
              />
            )}
          </Caption>
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};
