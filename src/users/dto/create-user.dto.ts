import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user1', description: 'Имя' })
  name: string;

  @ApiProperty({ example: 'user132', description: 'Логин' })
  login: string;

  @ApiProperty({ example: 'user@user.com', description: 'email' })
  email: string;

  @ApiProperty({ example: 'qwerty', description: 'Пароль' })
  password: string;
}
