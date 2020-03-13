import { ExceptionFilter, Catch, HttpException, ArgumentsHost, HttpStatus } from '@nestjs/common';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {

    const reply = host.switchToHttp().getResponse();

    const status = (error instanceof HttpException) ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    console.error(error);

    reply.code(status).send({
      status,
      message: (status === HttpStatus.INTERNAL_SERVER_ERROR ? 'INTERNAL_SERVER_ERROR' : error.message),
    });
  }
}
