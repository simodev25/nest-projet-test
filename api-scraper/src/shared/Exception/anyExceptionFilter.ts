import { ExceptionFilter, Catch, HttpException, ArgumentsHost, HttpStatus } from '@nestjs/common';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {

    const reply = host.switchToHttp().getResponse();

    const status = (error instanceof HttpException) ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
console.log('fffff',status)
    reply.code(200).send(error.message);
  }
}
