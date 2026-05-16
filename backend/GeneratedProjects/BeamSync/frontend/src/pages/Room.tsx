import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCallStore } from '../store/useCallStore';
import LocalStream from '../components/video/LocalStream';
import RemoteStream from '../components/video/RemoteStream';
import VideoGrid from '../components/video/VideoGrid';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { localStream, remoteStreams, joinRoom, leaveRoom } = useCallStore();
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (roomId && !hasJoinedRef.current) {
      joinRoom(roomId);
      hasJoinedRef.current = true;
    }

    return () => {
      if (hasJoinedRef.current) {
        leaveRoom();
        hasJoinedRef.current = false;
      }
    };
  }, [user, roomId, joinRoom, leaveRoom, navigate]);

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold">Room: {roomId}</h1>
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
          >
            Leave Room
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main video area */}
          <div className="lg:col-span-3">
            <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
              <VideoGrid>
                {localStream && <LocalStream stream={localStream} />}
                {Object.entries(remoteStreams).map(([id, stream]) => (
                  <RemoteStream key={id} id={id} stream={stream} />
                ))}
              </VideoGrid>
            </div>
          </div>

          {/* Sidebar with participants */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4 h-full">
              <h2 className="text-lg font-semibold mb-4">Participants</h2>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>You ({user?.email})</span>
                </li>
                {Object.keys(remoteStreams).map((id) => (
                  <li key={id} className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Participant {id.substring(0, 8)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Room;