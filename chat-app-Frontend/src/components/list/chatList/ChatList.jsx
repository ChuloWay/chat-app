import React, { useState, useEffect } from "react";
import "./chatList.css";
import { useSocket } from "../../../context/SocketContext";

const ChatList = ({ onSelectUser }) => {
  const socket = useSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadUsers, setUnreadUsers] = useState([]);

  useEffect(() => {
    const currentUserData = localStorage.getItem("chat-user");
    if (currentUserData) {
      try {
        const parsedUser = JSON.parse(currentUserData);
        console.log("Current user:", parsedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing current user data:", error);
      }
    } else {
      console.log("No current user found in localStorage.");
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("usersFound", (users) => {
        console.log("Users found:", users);
        const userIdsInResults = searchResults.map((user) => user._id);
        const uniqueUsers = users.filter(
          (user) => !userIdsInResults.includes(user._id)
        );
        setSearchResults((prevResults) => [...prevResults, ...uniqueUsers]);
      });

      socket.on("messageReceived", (message) => {

        setUnreadUsers((prevUsers) => {

          if (prevUsers.find((user) => user === message.sender)) {
            return [...prevUsers];
          } else {
            return [...prevUsers, message.sender];
          }
        });
      });
    }

    return () => {
      if (socket) {
        socket.off("usersFound");
        socket.off("messageReceived");
      }
    };
  }, [socket, currentUser]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!socket || !currentUser || !currentUser.user) return;

    console.log("Search query:", searchQuery);

    const { username, email, mobileNumber } = currentUser.user;


    if (!searchQuery) {
      console.log("Search query is empty or undefined.");
      return;
    }

    if (
      searchQuery === username ||
      searchQuery === email ||
      searchQuery === mobileNumber
    ) {
      alert("You cannot search for yourself.");
      return;
    }

    console.log("Searching for:", searchQuery);

    socket.emit("searchUsers", { query: searchQuery });
  };

  const handleUserSelect = (user) => {
    onSelectUser(user);
    setUnreadUsers((prevUsers) =>
      prevUsers.filter((unreadUser) => unreadUser !== user._id)
    );
  };

  const isUserUnread = (userId) => {
    return unreadUsers.includes(userId);
  };

  return (
    <div className="chatList">
      <form onSubmit={handleSearch} className="search">
        <div className="searchBar">
          <img src="/search.png" alt="Search Icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </form>
      <div className="results">
        {searchResults.length > 0 &&
          searchResults.map((user) => (
            <div
              key={user._id}
              className="item"
              onClick={() => handleUserSelect(user)}
            >
              <img src="./avatar.png" alt="User Avatar" />
              <div className="texts">
                <span>{user.username}</span>
                <p>{user.phoneNumber}</p>
              </div>
              {isUserUnread(user._id) && (
                <div className="unread-indicator">
                  <img src="/green-tick.png" alt="Unread Indicator" />
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ChatList;
