import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { FoldersService } from '../folders/folders.service';

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(FoldersService)
  private readonly foldersService: FoldersService;

  async create(createUserDto: CreateUserDto) {
    const newUser = createUserDto as User;
    await this.userRepository.save(newUser);
    await this.foldersService.createFolder(newUser.login, newUser.id);
    return newUser;
  }

  async getAuthToken(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        token: true,
      },
    });
    return user.token;
  }

  async save(user: User) {
    return this.userRepository.save(user);
  }

  async findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async findByLogin(login: string) {
    return this.userRepository.findOneBy({ login });
  }
}
