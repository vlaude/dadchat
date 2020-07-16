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

@WebSocketGateway({ namespace: 'events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private messages: string[] = [];
  private count: number = 0;

  @SubscribeMessage('new-message')
  handleMessage(@MessageBody() data: string): void {
    this.logger.log(`New message received : ${data}`);
    this.server.emit('new-message', data);
    this.messages.push(data);
  }

  handleConnection(@ConnectedSocket() client: Socket): void {
    this.count++;
    this.logger.log(`New connection. Total : ${this.count}`);
    this.server.emit('users-count', this.count);
    client.emit('all-messages', this.messages);
  }

  handleDisconnect(): void {
    this.count--;
    this.logger.log(`Someone disconnected.`);
    this.server.emit('users-count', this.count);
  }
}
