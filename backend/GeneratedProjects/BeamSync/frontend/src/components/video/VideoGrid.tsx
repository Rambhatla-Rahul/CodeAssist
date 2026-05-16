import React from 'react';
import LocalStream from './LocalStream';
import RemoteStream from './RemoteStream';
import { useCallStore } from '../../store/useCallStore';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Array<{
    id: string;
    stream: MediaStream | null;
    name: string;
    isAudioMuted?: boolean;
    isVideoMuted?: boolean;
  }>;
}

const VideoGrid: React.FC<VideoGridProps> = ({ localStream, remoteStreams }) => {
  const { isAudioMuted, isVideoMuted } = useCallStore();
  
  // Calculate grid classes based on number of participants
  const getGridClasses = () => {
    const totalParticipants = 1 + remoteStreams.length;
    
    if (totalParticipants === 1) {
      return 'grid-cols-1 grid-rows-1';
    } else if (totalParticipants === 2) {
      return 'grid-cols-2 grid-rows-1';
    } else if (totalParticipants <= 4) {
      return 'grid-cols-2 grid-rows-2';
    } else if (totalParticipants <= 6) {
      return 'grid-cols-3 grid-rows-2';
    } else if (totalParticipants <= 9) {
      return 'grid-cols-3 grid-rows-3';
    } else {
      return 'grid-cols-4 grid-rows-3';
    }
  };

  return (
    <div className={`grid ${getGridClasses()} gap-2 h-full w-full`}>
      {/* Local Stream */}
      <div className="aspect-video">
        <LocalStream stream={localStream} />
      </div>
      
      {/* Remote Streams */}
      {remoteStreams.map((participant) => (
        <div key={participant.id} className="aspect-video">
          <RemoteStream 
            stream={participant.stream}
            participantName={participant.name}
            isAudioMuted={participant.isAudioMuted}
            isVideoMuted={participant.isVideoMuted}
          />
        </div>
      ))}
      
      {/* Fill empty grid cells when needed */}
      {Array.from({ length: Math.max(0, 9 - remoteStreams.length - 1) }).map((_, index) => (
        <div key={`empty-${index}`} className="aspect-video bg-gray-900 rounded-lg"></div>
      ))}
    </div>
  );
};

export default VideoGrid;