import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import { PrismaService } from '../global-services/prisma.service';
import { CloudsService } from '../clouds/clouds.service';

@Injectable()
export class UsersService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(CloudsService)
  private readonly cloudsService: CloudsService;

  async create(createUserDto: CreateUserDto) {
    let newUser = createUserDto as User;
    newUser = await this.prisma.user.create({
      data: newUser,
    });
    await this.cloudsService.create({
      name: newUser.login,
      userId: newUser.id,
    });
    return newUser;
  }

  async getAuthToken(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      include: {
        Token: true,
      },
    });
    return user.Token;
  }

  async save(user: User) {
    return this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: user,
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findFirst({
      where: {
        id: id,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
      },
    });
  }

  async findByLogin(login: string) {
    return this.prisma.user.findFirst({
      where: {
        login,
      },
    });
  }
}
