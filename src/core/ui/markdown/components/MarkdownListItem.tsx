import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import createMarkdownComponent from './MarkdownComponent';

const Base = createMarkdownComponent('li');

const MarkdownListItem = (props: ReactMarkdownProps) => <Base sx={{ display: 'list-item' }} {...props} />;

export default MarkdownListItem;
