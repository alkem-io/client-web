import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import GridItem, { GridItemProps } from '@/core/ui/grid/GridItem';
import { Box } from '@mui/material';
import { GUTTER_MUI, GUTTER_PX } from '@/core/ui/grid/constants';
import { BlockTitle, PageTitle, Text } from '@/core/ui/typography';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import DataGridTable from '@/core/ui/table/DataGridTable';
import { GridColDef } from '@mui/x-data-grid';

const DummyContent = (props: GridItemProps) => (
  <GridItem {...props}>
    <Box height={10 * GUTTER_PX} sx={{ backgroundColor: 'background.default' }} />
  </GridItem>
);

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

interface AdminUsersTableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  invitationStatus: string;
}

const users: AdminUsersTableUser[] = [
  {
    id: '123',
    firstName: 'John',
    lastName: 'Dory',
    email: 'john@alkem.io',
    invitationStatus: 'status',
  },
  {
    id: '234',
    firstName: 'Jane',
    lastName: 'Dory',
    email: 'jane@alkem.io',
    invitationStatus: 'status',
  },
];
const columns: GridColDef<AdminUsersTableUser>[] = [
  {
    headerName: 'First Name',
    field: 'firstName',
  },
  {
    headerName: 'Last Name',
    field: 'lastName',
  },
];

const TableDemo = () => {
  return (
    <>
      <PageTitle textAlign="center" paddingY={GUTTER_MUI}>
        Table Demo
      </PageTitle>
      <PageContent>
        <PageContentColumn columns={3}>
          <PageContentBlock accent>
            <BlockTitle>Block Title</BlockTitle>
            <Text>{loremIpsum}</Text>
          </PageContentBlock>
          <PageContentBlock disableGap disablePadding>
            <PageContentBlockGrid>
              <DummyContent columns={2} />
              <DummyContent columns={2} />
            </PageContentBlockGrid>
          </PageContentBlock>
          <PageContentBlock disableGap disablePadding>
            <PageContentBlockGrid>
              <DummyContent columns={1} />
              <DummyContent />
            </PageContentBlockGrid>
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={9}>
          <PageContentBlock>
            <BlockTitle>Block Title</BlockTitle>
            <DataGridTable rows={users} columns={columns} onDelete={() => {}} />
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
    </>
  );
};

export default TableDemo;
