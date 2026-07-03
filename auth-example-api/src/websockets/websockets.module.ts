import { Module } from '@nestjs/common';
import { WebsocketsService } from './websockets.service';
import { WebsocketsController } from './websockets.controller';
import { EventsGateway } from './events.gateway';

@Module({
  controllers: [WebsocketsController],
  providers: [WebsocketsService, EventsGateway],
  exports: [EventsGateway],
})
export class WebsocketsModule {}
