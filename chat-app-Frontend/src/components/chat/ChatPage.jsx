import React, { useEffect, useState } from "react";
import List from "../list/List";
import Chat from "./Chat";
import Detail from "../detail/Detail";
import socketService from "../../services/socketService";
import { useAuth } from "../../context/AuthProvider";
import "./chat.css";
import "../detail/detail.css";
import "../list/list.css";

const ChatPage = () => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (auth?.user?._id) {
      socketService.connect(auth.user._id);

      socketService.setOnMessageReceived((message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [auth]);

  const handleSendMessage = (content) => {
    if (selectedUser) {
      const message = {
        sender: auth.user._id,
        receiver: selectedUser._id,
        content,
      };
      socketService.sendMessage(message);
      setMessages((prevMessages) => [...prevMessages, message]);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    socketService.getChatHistory(auth.user._id, user._id, (chatHistory) => {
      setMessages(chatHistory);
    });
  };

  const handleCloseDetail = () => {
    setSelectedUser(null);
  };

  const filteredMessages = selectedUser
    ? messages.filter(
        (msg) =>
          (msg.sender === auth.user._id && msg.receiver === selectedUser._id) ||
          (msg.sender === selectedUser._id && msg.receiver === auth.user._id)
      )
    : [];

  return (
    <div className="container">
      <List onSelectUser={handleUserSelect} />
      <Chat
        messages={filteredMessages}
        onSendMessage={handleSendMessage}
        selectedUser={selectedUser}
        setMessages={setMessages}
      />
      <Detail selectedUser={selectedUser} onCloseDetail={handleCloseDetail} />
    </div>
  );
};

export default ChatPage;
