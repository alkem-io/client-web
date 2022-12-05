import { useParams } from 'react-router-dom';
import UrlParams from './urlParams';

export const useUrlParams = (): UrlParams => useParams<UrlParams>();
