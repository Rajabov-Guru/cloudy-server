export class CreateUserDto {
  name: string;
  login: string;
  email: string;
  password: string;
  secret: number;
  refererLogin?: string;
  country?: string;
}
