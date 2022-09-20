import { useParams } from 'react-router-dom';
import UrlParams from '../core/routing/url-params';

export const useUrlParams = (): UrlParams => useParams<UrlParams>();
