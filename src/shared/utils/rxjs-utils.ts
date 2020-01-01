import { mergeMap, finalize } from 'rxjs/operators';
import { Observable, throwError, timer } from 'rxjs';
import { Exception } from '../Exception/exception';

export class RxjsUtils {

  public static genericRetryStrategy = (
    {
      maxRetryAttempts = 10,
      scalingDuration = 3000,
      excludedStatusCodes = [],
    }: {
      maxRetryAttempts?: number;
      scalingDuration?: number;
      excludedStatusCodes?: number[];
    } = {},
  ) => (attempts: Observable<any>) => {
    return attempts.pipe(
      mergeMap((error: Exception, i) => {
        const retryAttempt = i + 1;

        if(error instanceof Exception){
          // if maximum number of retries have been met
          // or response is a status code we don't wish to retry, throw error
          if (retryAttempt > maxRetryAttempts || excludedStatusCodes.find(e => e === error.getStatus())) {
            return throwError(error);
          }

          console.log(`[error CODE : ${error.getStatus()}]:Attempt ${retryAttempt}: retrying in ${retryAttempt * scalingDuration}ms`);
          // retry after 1s, 2s, etc...
        } else {
          if (retryAttempt > maxRetryAttempts ) {
            return throwError(error);
          }
          console.error(error);
          console.log(`[error CODE : ${error}]:Attempt ${retryAttempt}: retrying in ${retryAttempt * scalingDuration}ms`);
        }

        return timer( retryAttempt * scalingDuration);//retryAttempt * scalingDuration
      }),
    );
  };



}
