import { createParamDecorator } from '@nestjs/common';

export  const GetTask = createParamDecorator((data, req) => {

  return req.task;
});
