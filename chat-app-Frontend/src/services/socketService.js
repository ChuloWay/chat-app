import { io } from "socket.io-client";

let socket;

const connect = (userId) => {
  socket = io("http://localhost:2024/chatappevents", {
    query: { userId },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Connected to WebSocket server");
    socket.emit("join", { userId });
  });

  socket.on("userJoined", (userId) => {
    console.log("User joined:", userId);
  });

  socket.on("userStatusChanged", (status) => {
    console.log("User status changed:", status);
  });
};

const disconnect = () => {
  if (socket) {
    socket.disconnect();
    console.log("Disconnected from WebSocket server");
  }
};

const sendMessage = (message) => {
  if (socket) {
    socket.emit("sendMessage", message);
  } else {
    console.error("Socket not initialized or connection lost");
  }
};

const setOnMessageReceived = (callback) => {
  if (socket) {
    socket.on("receiveMessage", (message) => {
      callback(message);
    });
  }
};

const getChatHistory = (userId, contactId, callback) => {
  if (socket) {
    socket.emit("getMessages", { sender: userId, receiver: contactId });
    socket.on("messageHistory", (messages) => {
      callback(messages);
    });
  }
};

export default {
  connect,
  disconnect,
  sendMessage,
  setOnMessageReceived,
  getChatHistory,
  socket,
};
