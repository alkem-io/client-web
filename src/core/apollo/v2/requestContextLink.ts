import { ApolloLink, type FetchResult, Observable } from '@apollo/client';

type RequestContext = {
  requester: string;
  effective: string;
  anonymous: boolean;
};

export const createRequestContextLink = (onRetire: (error?: Error) => void) => {
  let current: RequestContext | undefined;
  let active = true;
  const retire = (error?: Error) => {
    if (!active) return;
    active = false;
    onRetire(error);
  };
  const obsolete = () => new Error('Authorization context changed while the operation was in flight');

  const link = new ApolloLink(
    (operation, forward) =>
      new Observable(observer => {
        if (!active) {
          observer.error(obsolete());
          return;
        }
        const receive = (result: FetchResult) => {
          if (observer.closed) return;
          if (!active) return observer.error(obsolete());
          const context = result.extensions?.requestContext as RequestContext | undefined;
          if (!context) {
            const error = new Error('The response did not include its admitted authorization context');
            retire(error);
            observer.error(error);
            return;
          }
          if (
            current &&
            (context.requester !== current.requester ||
              context.effective !== current.effective ||
              context.anonymous !== current.anonymous)
          ) {
            retire();
            observer.error(obsolete());
            return;
          }
          current = context;
          observer.next(result);
        };
        const subscription = forward(operation).subscribe({
          next: receive,
          error: error => {
            if (!active) return observer.error(obsolete());
            if (error.statusCode === 401) retire(error);
            observer.error(error);
          },
          complete: () => observer.complete(),
        });
        return () => subscription.unsubscribe();
      })
  );

  return {
    link,
    invalidate: () => retire(),
    stop: () => {
      active = false;
    },
  };
};
