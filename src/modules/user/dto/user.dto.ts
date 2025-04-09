import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches, IsEnum, IsEmail, IsOptional, IsIn } from 'class-validator';
import { PagingDto } from 'src/common/dto/filter-paging';
import { Role } from 'src/database/resource/bo-user.resource';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

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
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: ({ property }) => `${property} phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt`,
  })
  password: string;

  @ApiProperty()
  @IsString()
  @IsEnum(Role)
  role: Role;

  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['username'])) {}

export class UserPaginationQuery extends PagingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'email', 'phone', 'role', 'created_at'])
  sort?: string;
}
