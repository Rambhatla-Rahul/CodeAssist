// Shared signaling events used across frontend and backend

// Client to Server Events
export const JOIN_ROOM = 'join-room';
export const LEAVE_ROOM = 'leave-room';
export const OFFER = 'offer';
export const ANSWER = 'answer';
export const ICE_CANDIDATE = 'ice-candidate';
export const END_CALL = 'end-call';
export const START_SCREEN_SHARE = 'start-screen-share';
export const STOP_SCREEN_SHARE = 'stop-screen-share';

// Server to Client Events
export const USER_JOINED = 'user-joined';
export const USER_LEFT = 'user-left';
export const ROOM_FULL = 'room-full';
export const ROOM_NOT_FOUND = 'room-not-found';
export const CALL_ENDED = 'call-ended';
export const SCREEN_SHARE_STARTED = 'screen-share-started';
export const SCREEN_SHARE_STOPPED = 'screen-share-stopped';

// Error Events
export const ERROR = 'error';
