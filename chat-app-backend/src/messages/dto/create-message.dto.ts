import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateMessageDto {
  @IsNotEmpty()
  sender: Types.ObjectId;

  @IsNotEmpty()
  receiver: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  content: string;
}
