import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ 
    description: 'User email address', 
    example: 'user@example.com',
    required: true 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'User full name', 
    example: 'John Doe',
    minLength: 2,
    maxLength: 50,
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ 
    description: 'User password', 
    example: 'password123',
    minLength: 6,
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
