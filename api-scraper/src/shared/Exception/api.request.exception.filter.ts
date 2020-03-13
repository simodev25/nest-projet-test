import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
import { ApiRequestException } from './api.request.exception';

@Catch(ApiRequestException)
export class ApiRequestExceptionFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply<ServerResponse>>();
    const request = ctx.getRequest<FastifyRequest<IncomingMessage>>();

    const apiResponseDto = error.message;
    const status = (error instanceof ApiRequestException) ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).send(apiResponseDto);
  }
}
