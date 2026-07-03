import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WebsocketsService } from './websockets.service';
import { CreateWebsocketDto } from './dto/create-websocket.dto';
import { UpdateWebsocketDto } from './dto/update-websocket.dto';

@Controller('websockets')
export class WebsocketsController {
  constructor(private readonly websocketsService: WebsocketsService) {}

  @Post()
  create(@Body() createWebsocketDto: CreateWebsocketDto) {
    return this.websocketsService.create(createWebsocketDto);
  }

  @Get()
  findAll() {
    return this.websocketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.websocketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWebsocketDto: UpdateWebsocketDto) {
    return this.websocketsService.update(+id, updateWebsocketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.websocketsService.remove(+id);
  }
}
