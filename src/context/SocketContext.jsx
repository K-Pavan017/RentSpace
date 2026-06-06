import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Force websocket transport to ensure compatibility with Vercel and Render
    const socketUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3001'           // Local URL
      : 'https://rentals-k5bk.onrender.com'; // Production URL

    // 2. Initialize the single connection
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      upgrade: false 
    });
    
    setSocket(newSocket);

    // Clean up connection when the app unmounts
    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {/* Prevent components from crashing if they try to use the socket before it initializes */}
      {socket ? children : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading connection...</div>}
    </SocketContext.Provider>
  );
};