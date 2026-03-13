import { Box } from '@mui/material';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { GUTTER_MUI, GUTTER_PX } from '@/core/ui/grid/constants';
import GridItem, { type GridItemProps } from '@/core/ui/grid/GridItem';
import { BlockTitle, PageTitle, Text } from '@/core/ui/typography';
import CalloutBlockMarginal from '@/domain/collaboration/callout/calloutBlock/CalloutBlockMarginal';

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
        <PageContentColumn columns={3}>
          <PageContentBlock accent={true}>
            <BlockTitle>Block Title</BlockTitle>
            <Text>{loremIpsum}</Text>
          </PageContentBlock>
          <PageContentBlock disableGap={true} disablePadding={true}>
            <PageContentBlockGrid>
              <DummyContent columns={2} />
              <DummyContent columns={2} />
            </PageContentBlockGrid>
          </PageContentBlock>
          <PageContentBlock disableGap={true} disablePadding={true}>
            <PageContentBlockGrid>
              <DummyContent columns={1} />
              <DummyContent />
            </PageContentBlockGrid>
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={9}>
          <PageContentBlock disableGap={true} disablePadding={true}>
            <PageContentBlockGrid>
              <DummyContent columns={2} />
              <DummyContent columns={2} />
              <DummyContent columns={4} />
              <DummyContent columns={4} />
              <DummyContent columns={1} />
              <DummyContent />
            </PageContentBlockGrid>
          </PageContentBlock>
          <PageContentBlock halfWidth={true} disableGap={true} disablePadding={true}>
            <PageContentBlockGrid>
              <DummyContent columns={2} />
              <DummyContent columns={2} />
              <DummyContent />
            </PageContentBlockGrid>
          </PageContentBlock>
          <PageContentBlock halfWidth={true} disableGap={true} disablePadding={true}>
            <PageContentBlockGrid>
              <DummyContent columns={3} />
              <DummyContent columns={1} />
              <DummyContent />
            </PageContentBlockGrid>
          </PageContentBlock>
          <PageContentBlock disableGap={true} disablePadding={true}>
            <CalloutBlockMarginal variant="header">Callout</CalloutBlockMarginal>
            <PageContentBlockGrid cards={true}>
              <DummyContent columns={3} />
              <DummyContent columns={3} />
              <DummyContent columns={3} />
              <DummyContent columns={3} />
              <DummyContent columns={3} />
            </PageContentBlockGrid>
            <CalloutBlockMarginal variant="footer">Status</CalloutBlockMarginal>
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
    </>
  );
};

export default GridDemo;
