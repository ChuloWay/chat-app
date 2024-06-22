import "./userInfo.css";
import React from "react";
import chatIcon from "../../../assets/chatIcon.svg";


const UserInfo = () => {
  return (
    <div className="userInfo">
      <div className="user">
      <img src={chatIcon} alt="Login" className="form-header-image" />
      </div>
      {/* <div className="icons">
      <img src="./more.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./edit.png" alt="" />
      </div> */}
    </div>
  );
};

export default UserInfo;
