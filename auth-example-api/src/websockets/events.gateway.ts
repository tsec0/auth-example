import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL, credentials: true } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  declare server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Клиент свързан: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Клиент разкачен: ${client.id}`);
  }

  notifyNewLogin(userId: string, deviceInfo: string) {
    this.server.to(`room_user_${userId}`).emit('security_alert', {
      type: 'NEW_DEVICE_LOGIN',
      message: `Ново влизане от: ${deviceInfo}`,
      timestamp: new Date(),
    });
  }
}