import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCloud = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.cloud;
  },
);
