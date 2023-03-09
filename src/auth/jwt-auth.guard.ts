import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CloudsService } from '../clouds/clouds.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private cloudsService: CloudsService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({ message: 'Access denied' });
      }

      const user = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      const cloud = await this.cloudsService.findOne(user.id);
      req.user = user;
      req.cloud = cloud;
      return true;
    } catch (e) {
      throw new UnauthorizedException({ message: 'Access denied' });
    }
  }
}
