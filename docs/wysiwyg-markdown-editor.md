# WYSIWYG Markdown Editor

There was a requirement to simplify the text entry form fields and give them a more familiar look while keeping the functionality of storing rich text content and basic text formatting. For text formatting we are using Markdown language, and those form fields were based on this [component](https://github.com/uiwjs/react-md-editor) ([demo](https://uiwjs.github.io/react-md-editor/)) which looked like a native HTML textarea with a toolbar at the top to add Markdown tokens and a preview pane on the right to see what the resulting formatted text looks like.

## Stay with Markdown?

We are going to stick with Markdown, even though it is limited, it's easy to handle, easy to convert to HTML, and does not carry the risks of printing user-provided HTML. And because all of our stored content is already in Markdown. We just need a more user-friendly way to save Markdown texts in our system.

## WYSIWYG editors - Alternatives

### Requirements

- Editor must be easy to use and user friendly, must look like an email composer
- Must support basic text formatting like the previous one:
  - Bold and Italic text. (Markdown doesn't support underline)
  - Headers and Textblocks
  - Ordered and Unordered lists
  - Links
  - Emoticons
  - Images
  - Image upload
  - Toolbar buttons translations (optional, but desirable)

All these wysiwyg editors internally have a structure that holds the pieces of text+styles as blocks... This structure can be exported to json but the typical use case is to export it to HTML.

### More advanced Markdown editors

We explored a few of these, but the idea of all of these changes was to completely hide the Markdown syntax from users. These components were more like having a live preview while the user types Markdown codes.

- [https://lab.lepture.com/editor/](https://lab.lepture.com/editor/)
- [Toast UI Editor](https://www.npmjs.com/package/@toast-ui/editor) This one is discarded it because of the Google Analytics statistics collection notice.
- ...

### Other WYSIWYG editors

Explored [Quill](https://quilljs.com/) and [Slate](https://github.com/ianstormtaylor/slate), they both look very promising but too powerful, they have plugins to export to markdown but at the time of this investigation they didn't have good demos of markdown usage... (Some failing codesandboxes, one of the importing plugins was rendering markdown to HTML and then importing that html into the markdown editor...)

The chosen component [react-draft-wysiwyg](https://www.npmjs.com/package/react-draft-wysiwyg) is [opensource](https://github.com/jpuri/react-draft-wysiwyg) and is based on [DraftJS](https://www.npmjs.com/package/draft-js) an opensource WYSIWYG editor made by facebook, because it looked simpler, because DraftJS has a huge community behind, and because they have [clear examples](https://jpuri.github.io/react-draft-wysiwyg/#/demo) of Markdown handling in [their documentation](https://jpuri.github.io/react-draft-wysiwyg/#/docs).

## Markdown conversion

- Whatever editor we use, it _must_ have Markdown <=> (Editor's Internal Structure) bidirectional conversion.
- The Markdown generated should be compatible with [our current renderer](https://github.com/remarkjs/react-markdown)
- The conversions should not break the text format. e.g. A user writes a text with a specific format, on save that content gets converted to Markdown and saved in our database, then on reload the page, editor should show exactly what the user left in it.

There are several NPM packages that do the conversion from the DraftJS Estate Object to Markdown and back but it's not trivial and some work better than others.

The selected one that does a good job: [draftjs-md-converter](https://www.npmjs.com/package/draftjs-md-converter)

These following ones were very promising but couldn't convert certain text formats or images and we couldn't use them without writing plugins for them or changing the source code and including them in our code base:

- [draftjs-to-markdown](https://www.npmjs.com/package/draftjs-to-markdown) This is the package that is shown by the Editor's author, but it [doesn't support reverse conversion](https://github.com/jpuri/draftjs-to-markdown/issues/41).
- [markdown-draft-js](https://www.npmjs.com/package/markdown-draft-js)
  - There was a very promising fork [@beincomm/markdown-draft-js](https://www.npmjs.com/package/@beincomm/markdown-draft-js), but was discarded because it didn't support images directly.
  - markdown-draft-js has some good messages in the github issues with solutions to certain problems that are not addressed in their main branch, it worked quite well integrated in our codebase but the chosen converter works well out of the box.
- [draft-js-export-markdown](https://www.npmjs.com/package/draft-js-export-markdown)/[draft-js-import-markdown](https://www.npmjs.com/package/draft-js-import-markdown) Failed with weird errors trying to import even small markdowns

## Emoticons

The database was not saving the emoji's UTF-8 chars correctly. Changing the connection settings in the server fixed the problem: [PR2269](https://github.com/alkem-io/server/pull/2269)

Emojis can be set in `./src/common/components/composite/forms/FormikMarkdownField/toolbar.configuration.ts` ([docs](https://jpuri.github.io/react-draft-wysiwyg/#/docs))

```
emoji: {
  emojis: ['😀', '😁'...]
}
```

## Image upload

The ([API](https://jpuri.github.io/react-draft-wysiwyg/#/docs)) supports adding an image by url and also provides a little dialog with a file form field. When the user pushes there an image a JavaScript callback is executed that should return a promise that will resolve to the url of the image.

e.g.:

```
  const handleImageUpload = useCallback(() => {
    let promise = new Promise(function (resolve, _reject) {
      setTimeout(() => {
        resolve({
          // Url returned by the image storage service:
          data: { link: 'https://alkem.io/alkemio-banner/alkemio-banner-xl.png' },
        });
      }, 1000);
    });
    return promise;
  }, []);

  const toolbar = {
    ...ToolbarConfiguration,
    image: {
      ...ToolbarConfiguration.image,
      uploadCallback: handleImageUpload,
    },
  };
```

Note the `Promise` resolves to an object `{ data: { link: '...' }}`

### Problems with image upload

- We wanted to display a message to the user when uploading an image, we will address that in the future.
- The editor supports aligning the image (left/center/right) and setting its size, which affects how it is displayed in the form, but that is not "translatable" into Markdown, so that information is lost. We have removed that functionality.

## Trimmed functionality

Features supported by the selected component but hidden/not used because of Markdown limitations or by decision.

- Formats
  - Underline
  - Strikethrough
  - Superscript/Subscript
  - Text alignment and justification
  - Font Family, size, color, etc...
  - Certain types of text blocks
- Links
  - Remove link
- Images
  - Image Aligning
  - Image Resizing
- History
  - Ability to undo/redo from the toolbar
- Mentions - ability to mention other users may be used in the future

## MaxLength

The maxLength, and text length in general, can be problematic because everything the user types is translated into Markdown, which may not be the same length due to Markdown formatting tokens.
But it is a common problem with all of these editors, none of the mentioned here have a maxLength implementation, only tricks in their github issues forums.
We are calculating the resulting markdown for each keystroke and for each action (pasting/changing styles/... can increase the size in more than 1 character at a time), but it is not trivial to prevent actions and loading a previous state causes the component to reset.

## Install

`npm` packages installed:

- react-draft-wysiwyg
- draftjs-md-converter
- @types/react-draft-wysiwyg

## Integration in our code

There is only one place in our codebase where this Markdown Editor was instantiated: `./src/common/components/composite/forms/FormikMarkdownField.tsx`
There is also a wrapper around FormikMarkdownField in `./src/domain/platformAdmin/components/Common/MarkdownInput.tsx` which may be better removed in the future

### State handling

As said before, all the code is wrapped inside `FormikMarkdownField.tsx`
This is a Formik field, so it begins like all other ones:
`const [field, meta, helper] = useField(name);`

The field value is converted to the internal DraftJS State object:
`return EditorState.createWithContent(convertFromRaw(mdToDraftjs(field.value)));`

On every State change we save the corresponding Markdown:

```
  const onEditorStateChange = newEditorState => {
    setEditorState(newEditorState);
    const currentMd = draftjsToMd(convertToRaw(newEditorState.getCurrentContent()));
    helper.setValue(currentMd);
  };
```

There was a special case, when the FormikField value gets resetted we need to refresh the EditorState:

```
  // Reset the form if value comes empty
  useEffect(() => {
    if (field.value === '') {
      setEditorState(EditorState.createEmpty());
    }
  }, [field.value]);
```

Note that every time we change the State, the cursor returns to the initial position in the form field, which can be annoying for users. Therefore, setting the value of the editor from the outside must be done carefully or changing the currentState instead of loading a new one.

## Usage

```
<FormikMarkdownField
  name="description"
  title="Description"
  placeholder="Write the description here"
  disabled={isSubmitting}
  maxLength={2000}
/>
```
