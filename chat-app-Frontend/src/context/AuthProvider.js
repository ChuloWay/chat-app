import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const storedUser = localStorage.getItem("chat-user");
        return storedUser ? JSON.parse(storedUser) : {};
    });

    useEffect(() => {
        if (auth) {
          localStorage.setItem('auth', JSON.stringify(auth));
        } else {
          localStorage.removeItem('auth');
        }
      }, [auth]);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
