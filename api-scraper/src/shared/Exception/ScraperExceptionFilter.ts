import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';




export class ScraperExceptionFilter implements ExceptionFilter {
  constructor() {

  }

  catch(exception: HttpException, host: ArgumentsHost) {
   console.log('exceptigggglklkglsklkglksdlkglsdkglklkslksdlon')
  }
}
