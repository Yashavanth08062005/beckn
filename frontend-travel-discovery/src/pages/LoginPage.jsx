// src/pages/LoginPage.jsx
import React, { useState } from "react";
import Login from "../components/Login";
import Register from "../components/Register";
import "../styles/auth.css"; // is file ko next step me banayenge

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-box">
          {isLogin ? (
            <Login switchForm={() => setIsLogin(false)} />
          ) : (
            <Register switchForm={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
