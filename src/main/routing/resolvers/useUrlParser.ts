import { useCallback, useMemo } from 'react';
import { JourneyPath } from '@/main/urlResolver/useUrlResolver';
import { matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type ParseResult =
  | {
      error: string;
    }
  | {
      journey: JourneyPath;
    };

interface UrlParserProvided {
  parseUrl: (url: string) => ParseResult;
}

const useUrlParser = (): UrlParserProvided => {
  const { t } = useTranslation();

  /**
   * I'm sure there must be a better way to do this but I haven't found it in a reasonable time.
   * I wanted react router to give me the params using the application's `Route`s and passing to it
   * a URL that I receive as a string, but it looks like it's not possible.
   */

  const parsers = useMemo(() => {
    /**
     * I also wanted that any subpath URL for example: ...opportunityName/settings, also be caught by the parser as the opportunity URL.
     */
    const demultiplexSubspace = (url: string): string[] =>
      [
        '/index',
        '/subspaces',
        '/opportunities',
        '/contributors',
        '/activity',
        '/calendar',
        '/settings',
        '/share',
        '',
      ].map(suffix => `${url}${suffix}`);

    const demultiplexSpace = (url: string): string[] =>
      ['/dashboard', '/community', '/subspaces', '/challenges', '/knowledge-base', '/settings', ''].map(
        suffix => `${url}${suffix}`
      );

    // Go from more specific to less specific
    return [
      ...demultiplexSubspace('/:spaceName/challenges/:level1SpaceName/opportunities/:level2SpaceName'),
      ...demultiplexSubspace('/:spaceName/challenges/:level1SpaceName'),
      ...demultiplexSpace('/:spaceName'),
    ];
  }, []);

  const parseUrl = useCallback(
    (url: string): ParseResult => {
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.origin === window.location.origin) {
          for (const parser of parsers) {
            const match = matchPath(
              {
                path: parser,
                caseSensitive: true,
                end: true,
              },
              parsedUrl.pathname
            );
            if (match && match.params) {
              const level = Object.keys(match.params).length - 1;
              if (level === 0 && match.params['spaceName']) {
                return { journey: [match.params['spaceName']] };
              } else if (level === 1 && match.params['spaceName'] && match.params['level1SpaceName']) {
                return { journey: [match.params['spaceName'], match.params['level1SpaceName']] };
              } else if (
                level === 2 &&
                match.params['spaceName'] &&
                match.params['level1SpaceName'] &&
                match.params['level2SpaceName']
              ) {
                return {
                  journey: [
                    match.params['spaceName'],
                    match.params['level1SpaceName'],
                    match.params['level2SpaceName'],
                  ],
                };
              } else {
                return { error: t('components.urlResolver.errors.invalidUrl') };
              }
            }
          }
          return { error: t('components.urlResolver.errors.invalidUrl') };
        } else {
          return { error: t('components.urlResolver.errors.invalidUrlOrigin') };
        }
      } catch (e) {
        return { error: t('components.urlResolver.errors.invalidUrlFormat') };
      }
    },
    [parsers]
  );
  return { parseUrl };
};

export default useUrlParser;
