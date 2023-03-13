import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCloudName = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.cloud.name;
  },
);
