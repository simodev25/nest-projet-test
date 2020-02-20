/**
 * Decorator that binds interceptors to the scope of the controller or method,
 * depending on its context.
 *
 * When `@UseInterceptors` is used at the controller level, the interceptor will
 * be applied to every handler (method) in the controller.
 *
 * When `@UseInterceptors` is used at the individual handler level, the interceptor
 * will apply only to that specific method.
 *
 * @param interceptors a single interceptor instance or class, or a list of
 * interceptor instances or classes.
 *
 * @see [Interceptors](https://docs.nestjs.com/interceptors)
 *
 * @usageNotes
 * Interceptors can also be set up globally for all controllers and routes
 * using `app.useGlobalInterceptors()`.  [See here for details](https://docs.nestjs.com/interceptors#binding-interceptors)
 *
 * @publicApi
 */
import { Inject, NestInterceptor } from '@nestjs/common';
import { validateEach } from './validate-each.util';
import { extendArrayMetadata } from './extend-metadata.util';
import { isFunction } from './shared.utils';

import { tap } from 'rxjs/operators';
import { LoggingInterceptor } from '../logger/logging.Interceptor';
import "reflect-metadata";
export function UseInterceptorsBis(
  ...interceptors: (NestInterceptor | Function)[]
) {
  return (target: any, key?: string, descriptor?: any) => {
    const isValidInterceptor = <T extends Function | Record<string, any>>(
      interceptor: T,
    ) =>
      interceptor &&
      (isFunction(interceptor) ||
        isFunction((interceptor as Record<string, any>).intercept));

    if (descriptor) {
      validateEach(
        target.constructor,
        interceptors,
        isValidInterceptor,
        '@UseInterceptors',
        'interceptor',
      );
      extendArrayMetadata(
        '__interceptors__',
        interceptors,
        descriptor.value,
      );
      return descriptor;
    }
    validateEach(
      target,
      interceptors,
      isValidInterceptor,
      '@UseInterceptors',
      'interceptor',
    );
    return target;
  };
}

export function logMethod(...interceptors: (LoggingInterceptor | Function)[]) {
  return function(
    target: Object,
    propertyName: string,
    descriptor: PropertyDescriptor) {

    const method = descriptor.value;

    descriptor.value = function(...args: any[]) {

      console.log(Reflect.getMetadata("design:type", target, propertyName));
      // [Function: Function]
      // Checks the types of all params
      console.log(Reflect.getMetadata("design:paramtypes", target, propertyName));
      // [[Function: Number]]
      // Checks the return type
      console.log(Reflect.getMetadata("design:returntype", target, propertyName));
      const previousValue = Reflect.getMetadata('__interceptors__', target) || [];
      console.log('previousValue',previousValue);
      const value = [...previousValue, ...interceptors];
      Reflect.defineMetadata('__interceptors__', value, target);
      console.log(interceptors);
      // (new LoggingInterceptor()).interceptService(target, propertyName, propertyDesciptor,);
      // convert list of greet arguments to string
      const params = args.map(a => JSON.stringify(a)).join();
      const start = Date.now();
      // invoke greet() and get its return value
      const result = method.apply(this, args);
      let r = result;
      //result.pipe(tap(data => {
     //   r = JSON.stringify(data);
      //  console.log(`Call in ${Date.now() - start}: ${propertyName}(${params}) => ${r}`);
      //}));
      // convert result to string

      // display in console the function call details

      // return the result of invoking the method
      return result;
    };
  };
}

export function logReflect(target:any,propertyKey:string) {


    console.log(Reflect.getMetadata("design:type", target, propertyKey));
    // [Function: Function]
    // Checks the types of all params
    console.log(Reflect.getMetadata("design:paramtypes", target, propertyKey));
    // [[Function: Number]]
    // Checks the return type
    console.log(Reflect.getMetadata("design:returntype", target, propertyKey));

}




