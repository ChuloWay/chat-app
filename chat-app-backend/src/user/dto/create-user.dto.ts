import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'username is required' })
  @IsString()
  @Matches(/^[a-zA-Z]+$/, {
    message: 'username can only contain letters',
  })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @Matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, {
    message: 'Invalid email format',
  })
  @Transform((params) => params.value.toLowerCase())
  email: string;

  @IsNotEmpty({ message: 'Phone Number is required' })
  @Matches(/^(?:\+234|234|0)((\d{10,11}))$/, {
    message: 'Invalid phone number format. Valid formats: +234XXXXXXXXX, 0XXXXXXXXX, or 07XXXXXXXXX',
  })
  
  phoneNumber: string;

  // @IsNotEmpty({ message: 'Password is required' })
  // @IsString()
  // @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,30}$/, {
  //   message: 'Invalid password format,  use 8-30 characters with at least one uppercase letter, one number and one special character',
  // })
  // password: string;
}
