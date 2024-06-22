import React from "react";
import "./detail.css";

const Detail = ({ selectedUser, onCloseDetail }) => {
//   const handleClose = () => {
//     onCloseDetail();
//   };

  if (!selectedUser) {
    return null;
  }

  return (
    <div className="detail">
      <div className="header">
        {/* <button className=""> */}
          {/* <img src="./arrowDown.png" alt="Close Icon" /> */}
        {/* </button> */}
        <div className="user">
          <img src="./avatar.png" alt="User Avatar" />
          <h2>{selectedUser.username}</h2>
          <p>{selectedUser.phoneNumber}</p>
          <p>{selectedUser.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Detail;
