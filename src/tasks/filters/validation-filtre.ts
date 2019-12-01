import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ValidationException } from './validation.exception';


@Catch(ValidationException)
export class ValidationFiltre implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    return res.status(400).json({
      statusCode: 400,
      createdBy: 'ValidationFiltre',
      validationErrors: exception.validationErrors,
  })
  }

}
