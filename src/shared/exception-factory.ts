import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ValidationException } from '../tasks/filters/validation.exception';

export class ExceptionFactory {

  static  validationPipe = (errors: ValidationError[]) => {

    const messages = errors.map((err: ValidationError) => {
      return `${err.property} has wrong value ${err.value} : ${Object.values(err.constraints).join(', ')}`;
    });

    return new ValidationException(messages);

  }

}
