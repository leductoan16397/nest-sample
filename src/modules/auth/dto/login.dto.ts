import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S+$/, { message: ({ property }) => `${property} không được chứa khoảng trắng` })
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^\S+$/, { message: ({ property }) => `${property} không được chứa khoảng trắng` })
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^\S+$/, { message: ({ property }) => `${property} không được chứa khoảng trắng` })
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^\S+$/, { message: ({ property }) => `${property} không được chứa khoảng trắng` })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: ({ property }) => `${property} phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt`,
  })
  newPassword: string;
}
