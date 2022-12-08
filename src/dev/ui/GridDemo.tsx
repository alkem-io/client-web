import PageContent from '../../core/ui/content/PageContent';
import PageContentColumn from '../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../core/ui/content/PageContentBlock';
import GridItem, { GridItemProps } from '../../core/ui/grid/GridItem';
import { Box } from '@mui/material';
import { GUTTER_MUI, GUTTER_PX } from '../../core/ui/grid/constants';
import { BlockTitle, PageTitle, Text } from '../../core/ui/typography';

const DummyContent = (props: GridItemProps) => (
  <GridItem {...props}>
    <Box height={10 * GUTTER_PX} sx={{ backgroundColor: 'background.default' }} />
  </GridItem>
);

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const GridDemo = () => {
  return (
    <>
      <PageTitle textAlign="center" paddingY={GUTTER_MUI}>
        Grid Demo
      </PageTitle>
      <PageContent>
        <PageContentColumn columns={4}>
          <PageContentBlock accent>
            <BlockTitle>Block Title</BlockTitle>
            <Text>{loremIpsum}</Text>
          </PageContentBlock>
          <PageContentBlock>
            <DummyContent columns={2} />
            <DummyContent columns={2} />
          </PageContentBlock>
          <PageContentBlock>
            <DummyContent columns={1} />
            <DummyContent />
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={8}>
          <PageContentBlock>
            <DummyContent columns={2} />
            <DummyContent columns={2} />
            <DummyContent columns={4} />
            <DummyContent columns={4} />
            <DummyContent columns={1} />
            <DummyContent />
          </PageContentBlock>
          <PageContentBlock cards>
            <DummyContent columns={3} />
            <DummyContent columns={3} />
            <DummyContent columns={3} />
            <DummyContent columns={3} />
            <DummyContent columns={3} />
            <DummyContent />
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
    </>
  );
};

export default GridDemo;
