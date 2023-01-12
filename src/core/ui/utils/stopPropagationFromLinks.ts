import stopPropagationIf from './stopPropagationIf';

const stopPropagationFromLinks = stopPropagationIf(event => (event.target as HTMLElement).tagName !== 'A');

export default stopPropagationFromLinks;
