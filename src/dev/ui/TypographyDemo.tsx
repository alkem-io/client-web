import { Box, Button } from '@mui/material';
import {
  BlockSectionTitle,
  BlockTitle,
  Caption,
  CardText,
  PageTitle,
  Tagline,
  Text,
  TextBlock,
} from '@/core/ui/typography';
import { GUTTER_MUI } from '@/core/ui/grid/constants';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const TypographyDemo = () => {
  return (
    <>
      <PageTitle textAlign="center" paddingY={GUTTER_MUI}>
        Typography Demo
      </PageTitle>
      <PageContent>
        <PageContentBlock>
          <PageTitle>Page Title</PageTitle>
          <BlockTitle>Block Title</BlockTitle>
          <BlockSectionTitle>Section title inside a block</BlockSectionTitle>
          <Tagline>Tagline</Tagline>
          <Box display="flex" gap={GUTTER_MUI}>
            <TextBlock>
              <Text>Regular body text</Text>
              <Text>{loremIpsum}</Text>
            </TextBlock>
            <TextBlock>
              <CardText>Body text on a card</CardText>
              <CardText>{loremIpsum}</CardText>
            </TextBlock>
          </Box>
          <Box display="flex" gap={GUTTER_MUI}>
            <Button>Buttons</Button>
            <Button variant="contained">Buttons</Button>
          </Box>
          <Caption>Captions, descriptions, automatically generated text</Caption>
          <Box display="flex" gap={GUTTER_MUI}>
            <TextBlock>
              <WrapperMarkdown>{`Markdown text with **strong** and *em*.\n\n${loremIpsum}`}</WrapperMarkdown>
            </TextBlock>
            <TextBlock>
              <WrapperMarkdown card>
                {`Markdown text with **strong** and *em* rendered on a card.\n\n${loremIpsum}`}
              </WrapperMarkdown>
            </TextBlock>
          </Box>
        </PageContentBlock>
      </PageContent>
    </>
  );
};

export default TypographyDemo;
