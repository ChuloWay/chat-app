import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';

@WebSocketGateway({ namespace: 'chatappevents', cors: true })
export class ChatGateway {
  @WebSocketServer() server: Server;
  private userSocketMap: Map<string, string> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(`Server connected: ${socket.id}`);
    });
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const userId = this.getUserIdBySocketId(client.id);
    if (userId) {
      await this.userService.updateUserOnlineStatus(userId, false);
      this.server.emit('userStatusChanged', { userId, isOnline: false });
    }
    this.userSocketMap.delete(client.id);
  }

  getUserIdBySocketId(socketId: string): string | undefined {
    return this.userSocketMap.get(socketId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() message: CreateMessageDto, @ConnectedSocket() client: Socket): Promise<void> {
    const savedMessage = await this.chatService.createMessage(message);
    console.log('Saved message:', savedMessage);
    this.server.to(message.receiver.toString()).emit('receiveMessage', savedMessage);
  }

  @SubscribeMessage('startChat')
  async handleStartChat(@MessageBody() data: { senderId: string; receiverId: string }, @ConnectedSocket() client: Socket): Promise<any> {
    console.log('Starting chat:', data);

    const message = await this.chatService.startChat(data.senderId, data.receiverId);
    this.server.to(data.receiverId).emit('receiveMessage', message);
    return message;
  }

  @SubscribeMessage('join')
  async handleJoin(@MessageBody('userId') userId: string, @ConnectedSocket() client: Socket): Promise<void> {
    client.join(userId);
    console.log('User joined:', userId);
    this.userSocketMap.set(client.id, userId);
    this.server.to(userId).emit('userJoined', userId);

    await this.deliverUndeliveredMessages(userId);
  }

  @SubscribeMessage('onlineStatus')
  async handleOnlineStatus(@MessageBody() data: { userId: string; isOnline: boolean }, @ConnectedSocket() client: Socket): Promise<void> {
    await this.userService.updateUserOnlineStatus(data.userId, data.isOnline);
    if (data.isOnline) {
      await this.deliverUndeliveredMessages(data.userId);
    }
    this.server.emit('userStatusChanged', { userId: data.userId, isOnline: data.isOnline });
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(@MessageBody() data: { sender: string; receiver: string }, @ConnectedSocket() client: Socket): Promise<any> {
    const messages = await this.chatService.getMessages(data.sender, data.receiver);
    client.emit('messageHistory', messages);
    return messages;
  }

  @SubscribeMessage('searchUsers')
  async handleSearchUsers(@MessageBody() data: { query: string }, @ConnectedSocket() client: Socket): Promise<void> {
    try {
      const users = await this.userService.searchUsers(data.query);
      client.emit('usersFound', users);
    } catch (error) {
      console.error('Error in handleSearchUsers:', error);
      client.emit('searchError', { message: 'Error searching users' }); // Emit error to client
    }
  }

  @SubscribeMessage('getContacts')
  async handleGetContacts(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket): Promise<any> {
    const contacts = await this.userService.getContacts(data.userId);
    client.emit('contactsList', contacts);
    return contacts;
  }

  private async deliverUndeliveredMessages(userId: string): Promise<void> {
    const undeliveredMessages = await this.chatService.getUndeliveredMessages(userId);
    undeliveredMessages.forEach((message) => {
      this.server.to(userId).emit('receiveMessage', message);
    });
    await this.chatService.markMessagesAsDelivered(undeliveredMessages);
  }
}
