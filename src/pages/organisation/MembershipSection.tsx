import React, { FC } from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell/TableCell';
import TableBody from '@material-ui/core/TableBody';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { MembershipResultEntry } from '../../models/graphql-schema';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import LinkIcon from '@material-ui/icons/Link';
import Section, { Header as SectionHeader } from '../../components/core/Section';
import { useTranslation } from 'react-i18next';
import { Loading } from '../../components/core';
import ErrorBlock from '../../components/core/ErrorBlock';
import { buildEcoverseUrl } from '../../utils/urlBuilders';
import { Tooltip } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  table: {
    '& > thead > tr > th': {
      background: theme.palette.primary.main,
      color: theme.palette.background.paper,
      textAlign: 'center',
    },
    '& td': {
      padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    },
    '& td > *': {
      height: 30,
    },
  },
  noRows: {
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
  },
}));

interface Props {
  entities: MembershipResultEntry[];
  entityName: string;
  title: string;
  tableTitle: string;
  noDataText: string;
  icon: React.ReactElement;
  link: boolean;
  loading: boolean;
  error: boolean;
}

const MembershipSection: FC<Props> = ({
  entities,
  entityName,
  tableTitle,
  title,
  icon,
  noDataText,
  link,
  loading,
  error,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <>
      <Section avatar={icon}>
        <SectionHeader text={title} />
      </Section>
      {loading && <Loading text={t('components.loading.message', { blockName: entityName })} />}
      {error && (
        <Grid container item xs={12}>
          <ErrorBlock blockName={entityName} />
        </Grid>
      )}
      {!loading && !error && (
        <Grid container justifyContent={'center'}>
          <Grid item xs={10}>
            <Table size="small" className={styles.table}>
              <TableHead>
                <TableRow>
                  <TableCell component="th">{tableTitle}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entities.length > 0 &&
                  entities.map(x => (
                    <TableRow key={`tr-${x.id}`}>
                      <TableCell key={`td-${x.id}`}>
                        <Grid container justifyContent={'space-between'} alignItems={'center'}>
                          <Grid item>{x.displayName}</Grid>
                          {link && (
                            <Grid item>
                              <Tooltip title={`Visit ${x.displayName}`}>
                                <IconButton aria-label="Visit" href={buildEcoverseUrl(x.nameID)} size={'small'}>
                                  <LinkIcon />
                                </IconButton>
                              </Tooltip>
                            </Grid>
                          )}
                        </Grid>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      )}
      {entities.length === 0 && <Typography className={styles.noRows}>{noDataText}</Typography>}
    </>
  );
};
export default MembershipSection;
