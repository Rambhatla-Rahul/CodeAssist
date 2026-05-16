import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { SfuService } from './sfu.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sfu')
@UseGuards(JwtAuthGuard)
export class SfuController {
  constructor(private readonly sfuService: SfuService) {}

  @Post('room/:roomId')
  async createRoom(@Param('roomId') roomId: string) {
    try {
      await this.sfuService.createRoom(roomId);
      return { success: true, message: `Room ${roomId} created successfully` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('transport/:roomId/:userId')
  async createTransport(
    @Param('roomId') roomId: string,
    @Param('userId') userId: string,
  ) {
    try {
      const transport = await this.sfuService.createWebRtcTransport(roomId, userId);
      return {
        success: true,
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        sctpParameters: transport.sctpParameters,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('transport/:transportId/connect')
  async connectTransport(
    @Param('transportId') transportId: string,
    @Body('dtlsParameters') dtlsParameters: any,
  ) {
    try {
      await this.sfuService.connectTransport(transportId, dtlsParameters);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('produce/:transportId')
  async produce(
    @Param('transportId') transportId: string,
    @Body() producerOptions: any,
  ) {
    try {
      const producer = await this.sfuService.produce(transportId, producerOptions);
      return {
        success: true,
        id: producer.id,
        kind: producer.kind,
        rtpParameters: producer.rtpParameters,
        type: producer.type,
        appData: producer.appData,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('consume/:transportId/:producerId')
  async consume(
    @Param('transportId') transportId: string,
    @Param('producerId') producerId: string,
    @Body('rtpCapabilities') rtpCapabilities: any,
  ) {
    try {
      const consumer = await this.sfuService.consume(transportId, producerId, rtpCapabilities);
      return {
        success: true,
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Get('router/rtp-capabilities/:roomId')
  async getRouterRtpCapabilities(@Param('roomId') roomId: string) {
    try {
      const router = await this.sfuService.createRoom(roomId); // Will return existing if already created
      return {
        success: true,
        rtpCapabilities: router.rtpCapabilities,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
