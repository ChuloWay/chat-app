import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import "./chat.css";
import { useAuth } from "../../context/AuthProvider";

const Chat = ({ messages, onSendMessage, selectedUser, setMessages }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { auth } = useAuth();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEmoji = (emoji) => {
    setText((prevText) => prevText + emoji.emoji);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const timeZone = "Africa/Lagos";
    const zonedDate = parseISO(timestamp);
    const now = new Date();
    if (now - zonedDate < 60000) { 
      return "now";
    } else {
      return formatInTimeZone(zonedDate, timeZone, "p");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      if (selectedUser) {
        onSendMessage(text);
        setText(""); 
      } else {
        console.error("Selected user not defined");
      }
    }
  };

  return (
    <div className="chat">
      <div className="top">
        {selectedUser && (
          <div className="user">
            <img src="./avatar.png" alt="User Avatar" />
            <div className="texts">
              <span>{selectedUser.username}</span>
            </div>
          </div>
        )}
      </div>
      <div className="center">
        {!selectedUser && (
          <div className="start-chat">
            <p>Start a Chat</p>
          </div>
        )}
        {selectedUser &&
          messages.map((msg, index) => (
            <div
              key={msg._id}
              className={`message ${msg.sender === auth.user._id ? "own" : ""}`}
            >
              {msg.sender !== auth.user._id && (
                <img src="./avatar.png" alt="User Message" />
              )}
              <div className="texts">
                <p>{msg.content}</p>
                <span>{formatTimestamp(msg.timestamp)}</span>
              </div>
            </div>
          ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <form onSubmit={handleSubmit} className="chat-form">
          <input
            type="text"
            placeholder="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="emoji">
            <img
              src="./emoji.png"
              alt="Emoji Icon"
              onClick={() => setOpen((prev) => !prev)}
            />
            {open && (
              <div className="picker">
                <EmojiPicker onEmojiClick={handleEmoji} />
              </div>
            )}
          </div>
          <button type="submit" className="sendButton">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
