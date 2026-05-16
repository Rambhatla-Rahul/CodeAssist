export interface IceCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}

export interface SessionDescription {
  type: RTCSdpType;
  sdp: string;
}

export interface SignalData {
  sessionId: string;
  userId: string;
  signalType: 'offer' | 'answer' | 'ice-candidate' | 'screen-offer' | 'screen-answer';
  data: SessionDescription | IceCandidate;
  timestamp: number;
}

export interface Participant {
  userId: string;
  username: string;
  isScreenSharing?: boolean;
}

export interface RoomState {
  roomId: string;
  participants: Participant[];
  createdAt: number;
}

export interface MediaConstraints {
  audio: boolean;
  video: boolean | MediaTrackConstraints;
}

export interface ScreenShareConstraints {
  video: {
    cursor: 'always' | 'motion' | 'never';
    displaySurface?: 'application' | 'browser' | 'monitor' | 'window';
  };
  audio?: boolean | MediaTrackConstraints;
}
