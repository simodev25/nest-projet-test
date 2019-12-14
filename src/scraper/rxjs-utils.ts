
import { mergeMap, finalize } from 'rxjs/operators';
import { Observable, throwError, timer } from 'rxjs';

export class RxjsUtils {

   public static genericRetryStrategy = (
    {
      maxRetryAttempts = 10,
      scalingDuration = 1000,
      excludedStatusCodes = []
    }: {
      maxRetryAttempts?: number;
      scalingDuration?: number;
      excludedStatusCodes?: number[];
    } = {}
  ) => (attempts: Observable<any>) => {
    return attempts.pipe(
      mergeMap((error, i) => {
        const retryAttempt = i + 1;
        // if maximum number of retries have been met
        // or response is a status code we don't wish to retry, throw error
        if (retryAttempt > maxRetryAttempts || excludedStatusCodes.find(e => e === error.status)) {
          return throwError(error);
        }
       // console.error(error);
        console.log(`Attempt ${retryAttempt}: retrying in ${retryAttempt * scalingDuration}ms`);
        // retry after 1s, 2s, etc...
        return timer(retryAttempt * scalingDuration);
      })
    );
  };

}
