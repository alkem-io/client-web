import React, { useMemo, useState } from 'react';
import {
  EditorComponent,
  MentionAtomPopupComponent,
  MentionAtomState,
  Remirror,
  RemirrorProps,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';
import { MarkdownExtension } from '@remirror/extension-markdown';
import { MarkdownOptions } from '@remirror/extension-markdown/dist-types/markdown-extension';
import { MentionAtomExtension, MentionAtomOptions } from '@remirror/extension-mention-atom';
import { MentionAtomNodeAttributes } from '@remirror/extension-mention-atom/dist-types/mention-atom-extension';
import { AllStyledComponent } from '@remirror/styles/emotion';
import { gutters } from '../../grid/utils';
import { Box } from '@mui/material';

interface MarkdownTextFieldProps extends Partial<Omit<RemirrorProps, 'onChange'>> {
  value: string;
  onChange?: (value: string) => void;
}

const markdownExtensionOptions: MarkdownOptions = {
  copyAsMarkdown: false,
};

enum MentionType {
  User = 'user',
}

const mentionExtensionOptions: MentionAtomOptions = {
  matchers: [
    {
      name: MentionType.User,
      char: '@',
      matchOffset: 2,
    },
  ],
};

interface MentionComponentProps {
  users: MentionAtomNodeAttributes[];
}

interface MatchResult {
  item: MentionAtomNodeAttributes;
  matchIndex: number;
}

function MentionComponent(props: MentionComponentProps) {
  const [mentionState, setMentionState] = useState<MentionAtomState | null>();

  const items = useMemo(() => {
    if (!mentionState) {
      return [];
    }

    const allItems = props.users;

    if (!allItems) {
      return [];
    }

    const query = mentionState.query.full.toLowerCase() ?? '';

    return allItems
      .map((item): MatchResult => {
        const matchIndex = item.label.toLowerCase().indexOf(query) || item.label.toLowerCase().indexOf(query);
        return {
          item,
          matchIndex,
        };
      })
      .filter(({ matchIndex }) => matchIndex !== -1)
      .sort((l, r) => l.matchIndex - r.matchIndex)
      .map(({ item }) => item);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentionState, props.users]);

  return <MentionAtomPopupComponent onChange={setMentionState} items={items} />;
}

const MarkdownTextField = ({ onChange, ...props }: MarkdownTextFieldProps) => {
  const extensions = useMemo(
    () => () => [new MentionAtomExtension(mentionExtensionOptions), new MarkdownExtension(markdownExtensionOptions)],
    []
  );

  const { manager } = useRemirror({
    extensions,
    stringHandler: 'markdown',
  });

  const handleChange: RemirrorProps<MarkdownExtension>['onChange'] = ({ state, helpers }) => {
    onChange?.(helpers.getMarkdown(state));
  };

  return (
    <AllStyledComponent>
      <Box
        sx={{
          '.remirror-editor-wrapper': {
            padding: 0,
          },
          '.remirror-theme .ProseMirror': {
            minHeight: gutters(2),
            padding: gutters(0.5),
          },
        }}
      >
        <ThemeProvider>
          <Remirror manager={manager} onChange={handleChange} {...props}>
            <EditorComponent />
            <MentionComponent
              users={[
                { id: 'john', label: 'John' },
                { id: '1234', label: 'Matthew' },
              ]}
            />
          </Remirror>
        </ThemeProvider>
      </Box>
    </AllStyledComponent>
  );
};

export default MarkdownTextField;
