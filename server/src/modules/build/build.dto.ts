import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class BuildDTO {
  @IsNotEmpty()
  readonly name: string;
}
