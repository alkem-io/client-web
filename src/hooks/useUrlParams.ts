import { useParams } from 'react-router-dom';
import UrlParams from '../routing/ulr-params';

export const useUrlParams = (): UrlParams => useParams<UrlParams>();
