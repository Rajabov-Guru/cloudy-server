import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../global-services/prisma.service';
import { CloudsModule } from '../clouds/clouds.module';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => CloudsModule)],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
