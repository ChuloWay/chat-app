import React, { useState, useContext, useRef } from "react";
import { z } from "zod";
import chatIcon from "../../assets/chatIcon.svg";
import AuthContext from "../../context/AuthProvider";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

const LOGIN_URL = "api/v1/auth/login";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{11}$/, "Phone number must be 11 digits"),
});

export const Login = ({ onFormSwitch }) => {
  const userRef = useRef();
  const errRef = useRef();
  const navigate = useNavigate();

  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(LOGIN_URL, JSON.stringify({ email, phone }), {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      const responseData = response?.data?.data;
      const token = responseData?.token;
      const user = responseData?.user;

      setAuth({ user, token });

      localStorage.setItem("chat-user", JSON.stringify({ user, token }));

      navigate("/chat");
    } catch (err) {
      if (!err?.response) {
        setErrors({ form: "No Server Response" });
      } else if (err.response?.status === 400) {
        setErrors({ form: "Missing Email" });
      } else if (err.response?.status === 401) {
        setErrors({ form: "Unauthorized" });
      } else {
        setErrors({ form: "Login Failed" });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "phone") {
      setPhone(value);
    }

    const fieldResult = schema
      .pick({ [name]: true })
      .safeParse({ [name]: value });
    if (fieldResult.success) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: fieldResult.error.format()[name]._errors[0],
      }));
    }
  };

  return (
    <div className="auth-form-container">
      <img src={chatIcon} alt="Login" className="form-header-image" />
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          value={email}
          type="email"
          placeholder="Email"
          id="email"
          name="email"
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}
        <input
          value={phone}
          type="tel"
          placeholder="Phone Number"
          id="phone"
          name="phone"
          onChange={handleChange}
        />
        {errors.phone && <p className="error">{errors.phone}</p>}
        <button type="submit">Log In</button>
      </form>
      <button className="link-btn" onClick={() => onFormSwitch("register")}>
        Don't have an account? Register here
      </button>
    </div>
  );
};
