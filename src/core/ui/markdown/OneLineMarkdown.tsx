import WrapperMarkdown from './WrapperMarkdown';

/**
 * A Markdown renderer that sets <p> margins to 0.
 * Suitable for replacing plain text fragments with Markdown without breaking the visual structure.
 * @param children
 * @constructor
 */
const OneLineMarkdown = ({ children }: { children: string }) => (
  <WrapperMarkdown plain={true} card={true}>
    {children}
  </WrapperMarkdown>
);

export default OneLineMarkdown;
