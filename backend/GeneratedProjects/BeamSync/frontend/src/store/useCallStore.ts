import { create } from 'zustand';
import { MediaStream } from 'react-native-webrtc'; // Assuming react-native-webrtc or similar WebRTC library

interface Participant {
  id: string;
  username: string;
  stream?: MediaStream;
}

interface CallState {
  roomId: string | null;
  isInCall: boolean;
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  participants: Record<string, Participant>;
  joinCall: (roomId: string) => void;
  leaveCall: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  setLocalStream: (stream: MediaStream | null) => void;
  addRemoteStream: (participantId: string, stream: MediaStream) => void;
  removeRemoteStream: (participantId: string) => void;
  updateParticipant: (participantId: string, updates: Partial<Participant>) => void;
  clearCallState: () => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  roomId: null,
  isInCall: false,
  isMicEnabled: true,
  isCameraEnabled: true,
  localStream: null,
  remoteStreams: {},
  participants: {},
  
  joinCall: (roomId) => set({ roomId, isInCall: true }),
  
  leaveCall: () => set({
    roomId: null,
    isInCall: false,
    localStream: null,
    remoteStreams: {},
    participants: {},
  }),
  
  toggleMic: () => set((state) => ({ isMicEnabled: !state.isMicEnabled })),
  
  toggleCamera: () => set((state) => ({ isCameraEnabled: !state.isCameraEnabled })),
  
  setLocalStream: (stream) => set({ localStream: stream }),
  
  addRemoteStream: (participantId, stream) =>
    set((state) => ({
      remoteStreams: {
        ...state.remoteStreams,
        [participantId]: stream,
      },
    })),
  
  removeRemoteStream: (participantId) =>
    set((state) => {
      const { [participantId]: _, ...rest } = state.remoteStreams;
      return { remoteStreams: rest };
    }),
  
  updateParticipant: (participantId, updates) =>
    set((state) => ({
      participants: {
        ...state.participants,
        [participantId]: {
          ...(state.participants[participantId] || { id: participantId }),
          ...updates,
        },
      },
    })),
  
  clearCallState: () => set({
    roomId: null,
    isInCall: false,
    localStream: null,
    remoteStreams: {},
    participants: {},
  }),
}));
