import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { createClient } from 'mediasoup-client';
import { Worker, Router, WebRtcTransport, Producer, Consumer } from 'mediasoup-client/lib/types';

@Injectable()
export class SfuService {
  private readonly logger = new Logger(SfuService.name);
  private worker: Worker;
  private routers: Map<string, Router> = new Map(); // roomId -> Router
  private transports: Map<string, WebRtcTransport> = new Map(); // transportId -> Transport
  private producers: Map<string, Producer> = new Map(); // producerId -> Producer
  private consumers: Map<string, Consumer> = new Map(); // consumerId -> Consumer
  private redis: Redis;

  constructor() {
    this.initializeWorker();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  private async initializeWorker(): Promise<void> {
    try {
      this.worker = createClient({
        logLevel: 'warn',
        logTags: [
          'info',
          'ice',
          'dtls',
          'rtp',
          'srtp',
          'rtcp',
        ],
        rtcMinPort: 40000,
        rtcMaxPort: 49999,
      });
      this.logger.log('SFU Worker initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize SFU Worker:', error);
      throw error;
    }
  }

  async createRoom(roomId: string): Promise<Router> {
    if (this.routers.has(roomId)) {
      return this.routers.get(roomId);
    }

    const mediaCodecs = [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 1000,
        },
      },
    ];

    const router = await this.worker.createRouter({ mediaCodecs });
    this.routers.set(roomId, router);
    this.logger.log(`Created router for room ${roomId}`);
    return router;
  }

  async createWebRtcTransport(roomId: string, userId: string): Promise<WebRtcTransport> {
    const router = this.routers.get(roomId);
    if (!router) {
      throw new Error(`Router for room ${roomId} does not exist`);
    }

    const transport = await router.createWebRtcTransport({
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: process.env.ANNOUNCED_IP || '127.0.0.1',
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    const transportId = `${roomId}-${userId}-${transport.id}`;
    this.transports.set(transportId, transport);
    
    transport.on('dtlsstatechange', (dtlsState) => {
      if (dtlsState === 'closed') {
        transport.close();
        this.transports.delete(transportId);
      }
    });

    transport.on('close', () => {
      this.transports.delete(transportId);
    });

    this.logger.log(`Created WebRTC transport for user ${userId} in room ${roomId}`);
    return transport;
  }

  async connectTransport(transportId: string, dtlsParameters: any): Promise<void> {
    const transport = this.transports.get(transportId);
    if (!transport) {
      throw new Error(`Transport ${transportId} not found`);
    }

    await transport.connect({ dtlsParameters });
    this.logger.log(`Connected transport ${transportId}`);
  }

  async produce(transportId: string, producerOptions: any): Promise<Producer> {
    const transport = this.transports.get(transportId);
    if (!transport) {
      throw new Error(`Transport ${transportId} not found`);
    }

    const producer = await transport.produce(producerOptions);
    this.producers.set(producer.id, producer);
    
    producer.on('transportclose', () => {
      producer.close();
      this.producers.delete(producer.id);
    });

    this.logger.log(`Created producer ${producer.id}`);
    return producer;
  }

  async consume(transportId: string, producerId: string, rtpCapabilities: any): Promise<Consumer> {
    const transport = this.transports.get(transportId);
    if (!transport) {
      throw new Error(`Transport ${transportId} not found`);
    }

    const producer = this.producers.get(producerId);
    if (!producer) {
      throw new Error(`Producer ${producerId} not found`);
    }

    if (!transport.router.canConsume({ producerId, rtpCapabilities })) {
      throw new Error(`Cannot consume producer ${producerId}`);
    }

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: false,
    });

    this.consumers.set(consumer.id, consumer);
    
    consumer.on('transportclose', () => {
      consumer.close();
      this.consumers.delete(consumer.id);
    });

    this.logger.log(`Created consumer ${consumer.id} for producer ${producerId}`);
    return consumer;
  }

  async closeRoom(roomId: string): Promise<void> {
    const router = this.routers.get(roomId);
    if (router) {
      router.close();
      this.routers.delete(roomId);
      this.logger.log(`Closed router for room ${roomId}`);
    }
  }

  getTransport(transportId: string): WebRtcTransport | undefined {
    return this.transports.get(transportId);
  }

  getProducer(producerId: string): Producer | undefined {
    return this.producers.get(producerId);
  }

  getConsumer(consumerId: string): Consumer | undefined {
    return this.consumers.get(consumerId);
  }
}
