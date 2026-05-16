import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { SessionManager } from './session.manager';
import { Socket } from 'socket.io';

@Injectable()
export class SignalingService {
  private readonly logger = new Logger(SignalingService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly sessionManager: SessionManager,
  ) {}

  async handleOffer(socket: Socket, data: any): Promise<void> {
    const { sessionId, offer, targetUserId } = data;
    this.logger.log(`Handling offer for session ${sessionId}`);

    // Store offer in session
    await this.sessionManager.storeOffer(sessionId, offer);

    // Notify target user
    const targetSocketId = await this.sessionManager.getUserSocketId(targetUserId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit('offer', { sessionId, offer, userId: socket.data.userId });
    }
  }

  async handleAnswer(socket: Socket, data: any): Promise<void> {
    const { sessionId, answer, targetUserId } = data;
    this.logger.log(`Handling answer for session ${sessionId}`);

    // Store answer in session
    await this.sessionManager.storeAnswer(sessionId, answer);

    // Notify target user
    const targetSocketId = await this.sessionManager.getUserSocketId(targetUserId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit('answer', { sessionId, answer, userId: socket.data.userId });
    }
  }

  async handleIceCandidate(socket: Socket, data: any): Promise<void> {
    const { sessionId, candidate, targetUserId } = data;
    this.logger.log(`Handling ICE candidate for session ${sessionId}`);

    // Store ICE candidate
    await this.sessionManager.addIceCandidate(sessionId, candidate);

    // Notify target user
    const targetSocketId = await this.sessionManager.getUserSocketId(targetUserId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit('ice-candidate', { sessionId, candidate, userId: socket.data.userId });
    }
  }

  async createSession(initiatorId: string, participantIds: string[]): Promise<string> {
    this.logger.log(`Creating session initiated by ${initiatorId}`);
    
    // Create session in Redis
    const sessionId = await this.sessionManager.createSession(initiatorId, participantIds);
    
    return sessionId;
  }

  async joinSession(userId: string, sessionId: string): Promise<boolean> {
    this.logger.log(`User ${userId} joining session ${sessionId}`);
    
    // Add user to session
    const result = await this.sessionManager.addUserToSession(userId, sessionId);
    
    return result;
  }

  async leaveSession(userId: string, sessionId: string): Promise<void> {
    this.logger.log(`User ${userId} leaving session ${sessionId}`);
    
    // Remove user from session
    await this.sessionManager.removeUserFromSession(userId, sessionId);
    
    // Check if session should be terminated
    const participants = await this.sessionManager.getSessionParticipants(sessionId);
    if (participants.length === 0) {
      await this.sessionManager.terminateSession(sessionId);
    }
  }
}
