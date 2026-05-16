import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { createClient } from 'redis';

@Injectable()
export class SessionManager {
  private readonly logger = new Logger(SessionManager.name);
  private readonly redisClient: ReturnType<typeof createClient>;
  
  constructor(private readonly redisService: RedisService) {
    this.redisClient = this.redisService.getClient();
  }

  async createSession(initiatorId: string, participantIds: string[]): Promise<string> {
    // Generate unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session metadata
    const sessionData = {
      id: sessionId,
      initiatorId,
      participants: [...participantIds, initiatorId],
      createdAt: new Date().toISOString(),
      active: true
    };
    
    await this.redisClient.hSet(`session:${sessionId}`, sessionData);
    await this.redisClient.expire(`session:${sessionId}`, 3600); // Expire after 1 hour
    
    // Initialize session state
    await this.redisClient.set(`session:${sessionId}:offer`, '');
    await this.redisClient.set(`session:${sessionId}:answer`, '');
    await this.redisClient.lPush(`session:${sessionId}:iceCandidates`, []);
    
    this.logger.log(`Created session ${sessionId}`);
    return sessionId;
  }

  async storeOffer(sessionId: string, offer: any): Promise<void> {
    await this.redisClient.set(`session:${sessionId}:offer`, JSON.stringify(offer));
    this.logger.log(`Stored offer for session ${sessionId}`);
  }

  async storeAnswer(sessionId: string, answer: any): Promise<void> {
    await this.redisClient.set(`session:${sessionId}:answer`, JSON.stringify(answer));
    this.logger.log(`Stored answer for session ${sessionId}`);
  }

  async addIceCandidate(sessionId: string, candidate: any): Promise<void> {
    await this.redisClient.lPush(`session:${sessionId}:iceCandidates`, JSON.stringify(candidate));
    this.logger.log(`Added ICE candidate for session ${sessionId}`);
  }

  async getSessionParticipants(sessionId: string): Promise<string[]> {
    const sessionData = await this.redisClient.hGetAll(`session:${sessionId}`);
    return sessionData.participants ? JSON.parse(sessionData.participants) : [];
  }

  async addUserToSession(userId: string, sessionId: string): Promise<boolean> {
    const sessionExists = await this.redisClient.exists(`session:${sessionId}`);
    if (!sessionExists) {
      return false;
    }
    
    const participants = await this.getSessionParticipants(sessionId);
    if (!participants.includes(userId)) {
      participants.push(userId);
      await this.redisClient.hSet(`session:${sessionId}`, 'participants', JSON.stringify(participants));
    }
    
    return true;
  }

  async removeUserFromSession(userId: string, sessionId: string): Promise<void> {
    const participants = await this.getSessionParticipants(sessionId);
    const updatedParticipants = participants.filter(id => id !== userId);
    
    if (updatedParticipants.length > 0) {
      await this.redisClient.hSet(`session:${sessionId}`, 'participants', JSON.stringify(updatedParticipants));
    }
    
    this.logger.log(`Removed user ${userId} from session ${sessionId}`);
  }

  async terminateSession(sessionId: string): Promise<void> {
    await this.redisClient.del(
      `session:${sessionId}`,
      `session:${sessionId}:offer`,
      `session:${sessionId}:answer`,
      `session:${sessionId}:iceCandidates`
    );
    
    this.logger.log(`Terminated session ${sessionId}`);
  }

  async getUserSocketId(userId: string): Promise<string | null> {
    const socketId = await this.redisClient.get(`user:${userId}:socket`);
    return socketId || null;
  }

  async setUserSocketId(userId: string, socketId: string): Promise<void> {
    await this.redisClient.set(`user:${userId}:socket`, socketId);
    await this.redisClient.expire(`user:${userId}:socket`, 3600); // Expire after 1 hour
  }

  async removeUserSocketId(userId: string): Promise<void> {
    await this.redisClient.del(`user:${userId}:socket`);
  }
}
