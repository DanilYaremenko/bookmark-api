import {
  IsDate,
  IsEmail,
  IsInt,
  IsString,
} from 'class-validator';

export class GetUserDto {
  @IsInt()
  id: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  firstName: string | null;

  @IsString()
  lastName: string | null;
}
