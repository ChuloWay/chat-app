import React from "react";
import "./App.css";
import { AuthProvider } from "./context/AuthProvider";
import { SocketProvider } from "./context/SocketContext";
import ChatPage from "./components/chat/ChatPage";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Auth from "../src/components/auth/Auth"
import AuthContext from "./context/AuthProvider";

const PrivateRoute = ({ element }) => {
  const { auth } = React.useContext(AuthContext);
  return auth?.token ? element : <Navigate to="/auth" />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/auth/*" element={<Auth />} />
              <Route path="/chat" element={<PrivateRoute element={<ChatPage />} />} />
              <Route path="*" element={<Navigate to="/auth" />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
