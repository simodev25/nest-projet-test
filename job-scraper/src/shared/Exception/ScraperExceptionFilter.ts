import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { MongoError } from 'mongodb';


@Catch(MongoError)
export class ScraperExceptionFilter implements ExceptionFilter {
  constructor() {

  }

  catch(exception: HttpException, host: ArgumentsHost) {
   console.log('exceptigggglklkglsklkglksdlkglsdkglklkslksdlon')
  }
}
