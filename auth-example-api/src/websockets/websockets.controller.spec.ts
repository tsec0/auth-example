import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketsController } from './websockets.controller';
import { WebsocketsService } from './websockets.service';

describe('WebsocketsController', () => {
  let controller: WebsocketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebsocketsController],
      providers: [WebsocketsService],
    }).compile();

    controller = module.get<WebsocketsController>(WebsocketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
