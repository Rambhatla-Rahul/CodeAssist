import { useState, useEffect, useCallback } from 'react';
import { socket } from '../services/socket';
import { SIGNALING_EVENTS } from '../../shared/constants/signaling_events';
import type { SignalingMessage, OfferMessage, AnswerMessage, IceCandidateMessage } from '../types/signaling';

interface SignalingState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface UseSignalingProps {
  onOfferReceived: (message: OfferMessage) => void;
  onAnswerReceived: (message: AnswerMessage) => void;
  onIceCandidateReceived: (message: IceCandidateMessage) => void;
  onRemoteHangup: (userId: string) => void;
}

export const useSignaling = ({
  onOfferReceived,
  onAnswerReceived,
  onIceCandidateReceived,
  onRemoteHangup,
}: UseSignalingProps) => {
  const [state, setState] = useState<SignalingState>({
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const connect = useCallback(() => {
    if (state.isConnected || state.isConnecting) return;
    
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    socket.connect();
  }, [state.isConnected, state.isConnecting]);

  const disconnect = useCallback(() => {
    socket.disconnect();
    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const sendOffer = useCallback((offer: RTCSessionDescriptionInit, toUserId: string) => {
    const message: SignalingMessage = {
      type: SIGNALING_EVENTS.OFFER,
      payload: {
        sdp: offer.sdp,
        type: offer.type,
      },
      to: toUserId,
    };
    
    socket.emit(SIGNALING_EVENTS.SEND_SIGNAL, message);
  }, []);

  const sendAnswer = useCallback((answer: RTCSessionDescriptionInit, toUserId: string) => {
    const message: SignalingMessage = {
      type: SIGNALING_EVENTS.ANSWER,
      payload: {
        sdp: answer.sdp,
        type: answer.type,
      },
      to: toUserId,
    };
    
    socket.emit(SIGNALING_EVENTS.SEND_SIGNAL, message);
  }, []);

  const sendIceCandidate = useCallback((candidate: RTCIceCandidate, toUserId: string) => {
    const message: SignalingMessage = {
      type: SIGNALING_EVENTS.ICE_CANDIDATE,
      payload: {
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
      },
      to: toUserId,
    };
    
    socket.emit(SIGNALING_EVENTS.SEND_SIGNAL, message);
  }, []);

  const sendHangup = useCallback((toUserId: string) => {
    const message: SignalingMessage = {
      type: SIGNALING_EVENTS.HANGUP,
      to: toUserId,
    };
    
    socket.emit(SIGNALING_EVENTS.SEND_SIGNAL, message);
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      setState({
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    };

    const handleDisconnect = () => {
      setState({
        isConnected: false,
        isConnecting: false,
        error: null,
      });
    };

    const handleError = (error: any) => {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error?.message || 'Connection failed',
      }));
    };

    const handleOffer = (message: OfferMessage) => {
      onOfferReceived(message);
    };

    const handleAnswer = (message: AnswerMessage) => {
      onAnswerReceived(message);
    };

    const handleIceCandidate = (message: IceCandidateMessage) => {
      onIceCandidateReceived(message);
    };

    const handleHangup = (data: { userId: string }) => {
      onRemoteHangup(data.userId);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);
    socket.on(SIGNALING_EVENTS.OFFER, handleOffer);
    socket.on(SIGNALING_EVENTS.ANSWER, handleAnswer);
    socket.on(SIGNALING_EVENTS.ICE_CANDIDATE, handleIceCandidate);
    socket.on(SIGNALING_EVENTS.HANGUP, handleHangup);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
      socket.off(SIGNALING_EVENTS.OFFER, handleOffer);
      socket.off(SIGNALING_EVENTS.ANSWER, handleAnswer);
      socket.off(SIGNALING_EVENTS.ICE_CANDIDATE, handleIceCandidate);
      socket.off(SIGNALING_EVENTS.HANGUP, handleHangup);
    };
  }, [
    onOfferReceived,
    onAnswerReceived,
    onIceCandidateReceived,
    onRemoteHangup,
  ]);

  return {
    ...state,
    connect,
    disconnect,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendHangup,
  };
};
