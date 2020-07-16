import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as rug from 'random-username-generator';

export type User = {
  socketId: string;
  username: string;
};

export type Message = {
  poster: string;
  content: string;
};

@WebSocketGateway({ namespace: 'events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private messages: Message[] = [];
  private count: number = 0;
  private users: User[] = [];

  @SubscribeMessage('new-message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`New message received : ${data}`);
    const poster = this.users.find(u => u.socketId === client.id).username;
    const newMessage: Message = { poster, content: data };
    this.server.emit('new-message', newMessage);
    this.messages.push(newMessage);
  }

  handleConnection(@ConnectedSocket() client: Socket): void {
    this.count++;
    this.logger.log(`New connection. Total : ${this.count}`);
    this.server.emit('users-count', this.count);
    this.users.push({ socketId: client.id, username: rug.generate() });
    client.emit('all-messages', this.messages);
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    this.count--;
    const userIndex = this.users.findIndex(u => u.socketId === client.id);
    this.users.splice(userIndex, 1);
    this.logger.log(`Someone disconnected.`);
    this.server.emit('users-count', this.count);
  }
}
