import { makeStyles } from '@mui/styles';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Tag, { TagProps } from '../../../core/Tag';
import WrapperTypography from '../../../core/WrapperTypography';
import Card from '../../../core/Card';
import { Box } from '@mui/material';

const useMemberOfStyles = makeStyles(theme => ({
  listDetail: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.neutralLight.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noPadding: {
    padding: 0,
  },
}));

export type MemberOfProps = {
  groups: string[];
  challenges: string[];
  opportunities: string[];
  spaces: string[];
  organizations: string[];
};

const MemberOf: FC<MemberOfProps> = ({ groups, challenges, opportunities, spaces, organizations }) => {
  const { t } = useTranslation();
  const styles = useMemberOfStyles();

  const membershipItems = (names: string[], tagText: string, tagColor: TagProps['color'] = 'neutralMedium') => {
    return (
      names &&
      names.map((x, i) => (
        <div key={i} className={styles.listDetail}>
          <WrapperTypography as="span" className={styles.noPadding}>
            {x}
          </WrapperTypography>
          <Tag text={tagText} color={tagColor} />
        </div>
      ))
    );
  };

  return (
    <Box marginY={1}>
      <Card primaryTextProps={{ text: t('pages.user-profile.member-of') }}>
        {membershipItems(spaces, t('common.space'))}
        {membershipItems(groups, t('common.group'))}
        {membershipItems(challenges, t('common.challenge'))}
        {membershipItems(opportunities, t('common.opportunity'))}
        {membershipItems(organizations, t('common.organization'))}
      </Card>
    </Box>
  );
};

export default MemberOf;
