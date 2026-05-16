import { useState, useEffect, useCallback } from 'react';

interface MediaStreamState {
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
}

interface UseMediaStreamProps {
  audio?: boolean;
  video?: boolean;
  screenShare?: boolean;
}

export const useMediaStream = ({
  audio = true,
  video = true,
  screenShare = false,
}: UseMediaStreamProps = {}) => {
  const [state, setState] = useState<MediaStreamState>({
    stream: null,
    isLoading: false,
    error: null,
  });

  const getMediaStream = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      let stream: MediaStream;
      
      if (screenShare) {
        // @ts-ignore - TypeScript doesn't recognize getDisplayMedia yet
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio,
          video,
        });
      }
      
      setState({
        stream,
        isLoading: false,
        error: null,
      });
      
      return stream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get media stream';
      setState({
        stream: null,
        isLoading: false,
        error: errorMessage,
      });
      
      throw err;
    }
  }, [audio, video, screenShare]);

  const stopMediaStream = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
      setState({
        stream: null,
        isLoading: false,
        error: null,
      });
    }
  }, [state.stream]);

  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, [stopMediaStream]);

  return {
    ...state,
    getMediaStream,
    stopMediaStream,
  };
};
