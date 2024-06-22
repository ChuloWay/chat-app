import React, { useState } from "react";
import UserInfo from "./userInfo/UserInfo";
import ChatList from "./chatList/ChatList";

const List = ({ onSelectUser }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    onSelectUser(user);
  };

  return (
    <div className="list">
      <UserInfo />
      <ChatList onSelectUser={handleUserSelect} />
    </div>
  );
};

export default List;
