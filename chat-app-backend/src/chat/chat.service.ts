import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from 'src/messages/schemas/message.schema';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/schemas/user.schema';
import { MessagesService } from 'src/messages/messages.service';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly userService: UserService,
    private readonly messagesService: MessagesService,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const { sender, receiver, content } = createMessageDto;
    const newMessageObject = await this.messagesService.createMessage(createMessageDto);
    return newMessageObject;
  }

  async startChat(senderId: string, receiverId: string): Promise<Message> {
    const sender: User = await this.userService.findUserById(senderId);
    const receiver: User = await this.userService.findUserById(receiverId);

    if (!sender || !receiver) {
      throw new Error('Sender or receiver not found');
    }

    const messageDto: CreateMessageDto = {
      sender: new Types.ObjectId(senderId),
      receiver: new Types.ObjectId(receiverId),
      content: `Chat initiated with ${receiver.username}`,
    };

    const newMessageObject = await this.messagesService.createMessage(messageDto);
    return newMessageObject;
  }

  async getMessages(sender: string, receiver: string): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      })
      .sort('timestamp')
      .exec();
  }

  async getUndeliveredMessages(userId: string): Promise<MessageDocument[]> {
    return this.messageModel.find({ receiver: userId, isRead: false }).exec();
  }

  async markMessagesAsDelivered(messages: MessageDocument[]): Promise<void> {
    for (const message of messages) {
      message.isRead = true;
      await message.save();
    }
  }
}
