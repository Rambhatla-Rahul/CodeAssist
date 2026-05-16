import { io, Socket } from 'socket.io-client';
import { SignalingMessage } from '../types/signaling';

type MessageHandler = (message: SignalingMessage) => void;

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private isConnected: boolean = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to signaling server');
        this.isConnected = true;
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from signaling server:', reason);
        this.isConnected = false;
        
        if (reason === 'io server disconnect') {
          // Server actively disconnected, don't reconnect automatically
          console.log('Server initiated disconnection');
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      // Listen for all signaling events
      this.socket.onAny((event, payload) => {
        const handlers = this.messageHandlers.get(event);
        if (handlers) {
          handlers.forEach(handler => {
            handler({ type: event, payload } as SignalingMessage);
          });
        }
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  sendMessage(message: SignalingMessage): void {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket is not connected');
    }
    
    this.socket.emit(message.type, message.payload);
  }

  onMessage(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)?.push(handler);
  }

  offMessage(type: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  isConnectedToServer(): boolean {
    return this.isConnected;
  }
}

export default new SocketService();
