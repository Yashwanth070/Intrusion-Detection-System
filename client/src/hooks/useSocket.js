import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const PROD_BACKEND = 'https://intrusion-detection-backend-1jrs.onrender.com';
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (isLocalhost ? (window.location.port === '3000' ? '' : 'http://localhost:5001') : PROD_BACKEND);

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const subscribe = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  return { isConnected, subscribe, socket: socketRef.current };
}

export default useSocket;
