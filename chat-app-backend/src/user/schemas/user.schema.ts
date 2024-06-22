import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { hash } from 'bcrypt';
import { UserStatus } from '../enum/enum.index';
import { v4 as uuidv4 } from 'uuid'; 

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {

  @Prop({ default: uuidv4 }) // Default value is generated using uuidv4()
  _id: string;

  @Prop({ required: true, minlength: 4, maxlength: 20 })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  // @Prop({ required: true, minlength: 6 })
  // password: string;

  @Prop({ default: [] })
  contacts: string[];

  @Prop({ type: Boolean, default: false })
  isOnline: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// UserSchema.pre<User>('save', async function (next) {
//   const user = this;

//   try {
//     const hashedPassword = await hash(user.password, 10);
//     user.password = hashedPassword;
//     next();
//   } catch (error) {
//     return next(error);
//   }
// });

export { UserSchema };
