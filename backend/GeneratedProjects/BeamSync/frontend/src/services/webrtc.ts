import type { RTCPeerConnectionConfig } from '../../shared/types/webrtc';

// STUN/TURN server configuration
const WEBRTC_CONFIG: RTCPeerConnectionConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // TURN servers would be added here in production
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'password'
    // }
  ],
  iceCandidatePoolSize: 10,
};

export class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  
  createPeerConnection(remoteUserId: string): RTCPeerConnection {
    if (this.peerConnections.has(remoteUserId)) {
      throw new Error(`Peer connection already exists for user ${remoteUserId}`);
    }
    
    const pc = new RTCPeerConnection(WEBRTC_CONFIG);
    this.peerConnections.set(remoteUserId, pc);
    
    return pc;
  }
  
  getPeerConnection(remoteUserId: string): RTCPeerConnection | undefined {
    return this.peerConnections.get(remoteUserId);
  }
  
  removePeerConnection(remoteUserId: string): boolean {
    const pc = this.peerConnections.get(remoteUserId);
    if (pc) {
      pc.close();
      return this.peerConnections.delete(remoteUserId);
    }
    return false;
  }
  
  removeAllPeerConnections(): void {
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
  }
  
  async createOffer(remoteUserId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this.getPeerConnection(remoteUserId);
    if (!pc) {
      throw new Error(`No peer connection found for user ${remoteUserId}`);
    }
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }
  
  async createAnswer(remoteUserId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this.getPeerConnection(remoteUserId);
    if (!pc) {
      throw new Error(`No peer connection found for user ${remoteUserId}`);
    }
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }
  
  async setRemoteDescription(
    remoteUserId: string,
    description: RTCSessionDescriptionInit
  ): Promise<void> {
    const pc = this.getPeerConnection(remoteUserId);
    if (!pc) {
      throw new Error(`No peer connection found for user ${remoteUserId}`);
    }
    
    await pc.setRemoteDescription(new RTCSessionDescription(description));
  }
  
  async addIceCandidate(
    remoteUserId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    const pc = this.getPeerConnection(remoteUserId);
    if (!pc) {
      throw new Error(`No peer connection found for user ${remoteUserId}`);
    }
    
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
}

export const webRTCService = new WebRTCService();
