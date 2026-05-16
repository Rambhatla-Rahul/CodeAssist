import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WsJwtAuthGuard } from '../../common/guards/ws-jwt-auth.guard';
import { SignalingService } from './signaling.service';
import { SessionManager } from './session.manager';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class SignalingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SignalingGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly signalingService: SignalingService,
    private readonly sessionManager: SessionManager,
  ) {}

  afterInit() {
    this.logger.log('Signaling Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        this.logger.warn(`Unauthorized connection attempt`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token.replace('Bearer ', ''));
      client.data.userId = payload.sub;
      client.data.username = payload.username;
      
      this.logger.log(`Client connected: ${client.id} (${payload.username})`);
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}`, error.stack);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.sessionManager.handleClientDisconnect(client.id);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('join-room')
  async handleJoinRoom(client: Socket, payload: { roomId: string }) {
    try {
      const { roomId } = payload;
      const userId = client.data.userId;
      
      await this.sessionManager.addParticipantToRoom(roomId, client.id, userId);
      client.join(roomId);
      
      // Notify other participants in the room
      client.to(roomId).emit('participant-joined', {
        userId,
        clientId: client.id,
        username: client.data.username,
      });
      
      // Send room participants list to the new participant
      const participants = await this.sessionManager.getRoomParticipants(roomId);
      client.emit('room-participants', participants);
      
      this.logger.log(`User ${userId} joined room ${roomId}`);
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to join room' });
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('leave-room')
  async handleLeaveRoom(client: Socket, payload: { roomId: string }) {
    try {
      const { roomId } = payload;
      const userId = client.data.userId;
      
      client.leave(roomId);
      await this.sessionManager.removeParticipantFromRoom(roomId, client.id);
      
      // Notify other participants
      client.to(roomId).emit('participant-left', {
        userId,
        clientId: client.id,
      });
      
      this.logger.log(`User ${userId} left room ${roomId}`);
    } catch (error) {
      this.logger.error(`Error leaving room: ${error.message}`, error.stack);
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('offer')
  async handleOffer(
    client: Socket,
    payload: { targetClientId: string; sdp: any; roomId: string },
  ) {
    try {
      const { targetClientId, sdp, roomId } = payload;
      
      // Validate that both clients are in the same room
      const isInRoom = await this.sessionManager.isClientInRoom(roomId, client.id);
      const isTargetInRoom = await this.sessionManager.isClientInRoom(roomId, targetClientId);
      
      if (!isInRoom || !isTargetInRoom) {
        this.logger.warn(`Invalid offer: Clients not in same room`);
        return;
      }
      
      // Forward offer to target client
      this.server.to(targetClientId).emit('offer', {
        senderClientId: client.id,
        sdp,
        roomId,
      });
    } catch (error) {
      this.logger.error(`Error handling offer: ${error.message}`, error.stack);
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('answer')
  async handleAnswer(
    client: Socket,
    payload: { targetClientId: string; sdp: any; roomId: string },
  ) {
    try {
      const { targetClientId, sdp, roomId } = payload;
      
      // Validate that both clients are in the same room
      const isInRoom = await this.sessionManager.isClientInRoom(roomId, client.id);
      const isTargetInRoom = await this.sessionManager.isClientInRoom(roomId, targetClientId);
      
      if (!isInRoom || !isTargetInRoom) {
        this.logger.warn(`Invalid answer: Clients not in same room`);
        return;
      }
      
      // Forward answer to target client
      this.server.to(targetClientId).emit('answer', {
        senderClientId: client.id,
        sdp,
        roomId,
      });
    } catch (error) {
      this.logger.error(`Error handling answer: ${error.message}`, error.stack);
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('ice-candidate')
  async handleIceCandidate(
    client: Socket,
    payload: { targetClientId: string; candidate: any; roomId: string },
  ) {
    try {
      const { targetClientId, candidate, roomId } = payload;
      
      // Validate that both clients are in the same room
      const isInRoom = await this.sessionManager.isClientInRoom(roomId, client.id);
      const isTargetInRoom = await this.sessionManager.isClientInRoom(roomId, targetClientId);
      
      if (!isInRoom || !isTargetInRoom) {
        this.logger.warn(`Invalid ICE candidate: Clients not in same room`);
        return;
      }
      
      // Forward ICE candidate to target client
      this.server.to(targetClientId).emit('ice-candidate', {
        senderClientId: client.id,
        candidate,
        roomId,
      });
    } catch (error) {
      this.logger.error(`Error handling ICE candidate: ${error.message}`, error.stack);
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('disconnect-peer')
  async handleDisconnectPeer(
    client: Socket,
    payload: { targetClientId: string; roomId: string },
  ) {
    try {
      const { targetClientId, roomId } = payload;
      
      // Validate that both clients are in the same room
      const isInRoom = await this.sessionManager.isClientInRoom(roomId, client.id);
      const isTargetInRoom = await this.sessionManager.isClientInRoom(roomId, targetClientId);
      
      if (!isInRoom || !isTargetInRoom) {
        this.logger.warn(`Invalid disconnect request: Clients not in same room`);
        return;
      }
      
      // Notify target client to close connection
      this.server.to(targetClientId).emit('peer-disconnected', {
        senderClientId: client.id,
        roomId,
      });
    } catch (error) {
      this.logger.error(`Error handling disconnect peer: ${error.message}`, error.stack);
    }
  }
}
