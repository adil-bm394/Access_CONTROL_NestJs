import {
  IsNotEmpty,
  IsArray,
  IsInt,
  ArrayNotEmpty,
  IsString,
} from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString() 
  readonly name: string;

  @IsNotEmpty()
  @IsArray() 
  @ArrayNotEmpty() 
  @IsInt({ each: true })
  readonly userIds: number[];
}
