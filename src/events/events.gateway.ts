import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: 'events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private count: number = 0;

  @SubscribeMessage('new-message')
  handleMessage(@MessageBody() data: string): void {
    this.logger.log(`New message received : ${data}`);
    this.server.emit('new-message', data);
  }

  handleConnection(client: any, ...args: any[]): any {
    this.count++;
    this.logger.log(`New connection. Total : ${this.count}`);
  }

  handleDisconnect(client: any): any {
    this.count--;
    this.logger.log(`Someone disconnected.`);
  }
}
