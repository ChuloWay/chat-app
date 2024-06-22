
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; 

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ default: uuidv4 }) // Default value is generated using uuidv4()
  _id: string;


  @Prop({ ref: 'User', required: true })
  sender: string

  @Prop({  ref: 'User', required: true })
  receiver: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
