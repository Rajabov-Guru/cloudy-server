import { PartialType } from '@nestjs/swagger';
import { CreateCloudDto } from './create-cloud.dto';

export class UpdateCloudDto extends PartialType(CreateCloudDto) {}
