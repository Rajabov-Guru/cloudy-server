import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  async create(createUserDto: CreateUserDto) {
    let newUser = createUserDto as User;
    await this.userRepository.save(newUser);
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    return this.userRepository.save({ ...user, ...updateUserDto });
  }

  async findAll() {
    return this.userRepository.find();
  }
}
