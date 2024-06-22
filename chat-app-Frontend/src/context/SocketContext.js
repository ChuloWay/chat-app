import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:2024/chatappevents", {
      withCredentials: false,
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket.io server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      console.log('Disconnected from socket.io server');
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
