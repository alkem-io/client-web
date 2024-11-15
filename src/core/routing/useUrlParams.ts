import { useParams } from 'react-router-dom';
import UrlParams from '@/main/routing/urlParams';

export const useUrlParams = (): UrlParams => useParams<UrlParams>();
