export interface IceCandidateMessage {
  type: 'ice-candidate';
  payload: {
    sessionId: string;
    candidate: RTCIceCandidateInit;
    senderId: string;
    receiverId: string;
  };
}

export interface SdpOfferMessage {
  type: 'sdp-offer';
  payload: {
    sessionId: string;
    offer: RTCSessionDescriptionInit;
    senderId: string;
    receiverId: string;
  };
}

export interface SdpAnswerMessage {
  type: 'sdp-answer';
  payload: {
    sessionId: string;
    answer: RTCSessionDescriptionInit;
    senderId: string;
    receiverId: string;
  };
}

export interface JoinRoomMessage {
  type: 'join-room';
  payload: {
    roomId: string;
    userId: string;
  };
}

export interface LeaveRoomMessage {
  type: 'leave-room';
  payload: {
    roomId: string;
    userId: string;
  };
}

export interface UserJoinedMessage {
  type: 'user-joined';
  payload: {
    roomId: string;
    userId: string;
  };
}

export interface UserLeftMessage {
  type: 'user-left';
  payload: {
    roomId: string;
    userId: string;
  };
}

export interface StartCallMessage {
  type: 'start-call';
  payload: {
    targetUserId: string;
    callerId: string;
    sessionId: string;
  };
}

export interface EndCallMessage {
  type: 'end-call';
  payload: {
    sessionId: string;
    userId: string;
  };
}

export interface CallStartedMessage {
  type: 'call-started';
  payload: {
    sessionId: string;
    callerId: string;
    targetUserId: string;
  };
}

export interface CallEndedMessage {
  type: 'call-ended';
  payload: {
    sessionId: string;
  };
}

export interface FileTransferRequestMessage {
  type: 'file-transfer-request';
  payload: {
    sessionId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    senderId: string;
    receiverId: string;
  };
}

export interface FileTransferResponseMessage {
  type: 'file-transfer-response';
  payload: {
    sessionId: string;
    accepted: boolean;
    url?: string;
    senderId: string;
    receiverId: string;
  };
}

export type SignalingMessage =
  | IceCandidateMessage
  | SdpOfferMessage
  | SdpAnswerMessage
  | JoinRoomMessage
  | LeaveRoomMessage
  | UserJoinedMessage
  | UserLeftMessage
  | StartCallMessage
  | EndCallMessage
  | CallStartedMessage
  | CallEndedMessage
  | FileTransferRequestMessage
  | FileTransferResponseMessage;
