import React, { useState, useContext, useRef } from "react";
import { z } from "zod";
import chatIcon from "../../assets/chatIcon.svg";
import AuthContext from "../../context/AuthProvider";

import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

const REGISTER_URL = "api/v1/auth/register";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().regex(/^\d{11}$/, "Phone number must be 10 digits"),
  username: z.string(),
});

export const Register = ({ onFormSwitch }) => {
  const userRef = useRef();
  const errRef = useRef();
  const navigate = useNavigate();

  const { setAuth } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = schema.safeParse({ email, phoneNumber, username });
    if (!result.success) {
      const fieldErrors = result.error.format();
      setErrors({
        email: fieldErrors.email?._errors[0],
        phoneNumber: fieldErrors.phone?._errors[0],
        username: fieldErrors.username?._errors[0],
      });
      return;
    }

    try {
      const response = await axios.post(
        REGISTER_URL,
        JSON.stringify({ email, phoneNumber, username }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const responseData = response?.data?.data;
      const token = responseData?.token;
      const user = responseData?.user;

      setAuth({ user, token });

      localStorage.setItem("chat-user", JSON.stringify({ user, token }));

      setErrors({});
      navigate("/chat");
    } catch (err) {
      console.error("Registration Error:", err);
      if (err?.response) {
        if (err.response.status === 400) {
          setErrors({ form: "Missing Email" });
        } else {
          setErrors({ form: "Registration Failed" });
        }
      } else {
        setErrors({ form: "No Server Response" });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "phone") {
      setPhoneNumber(value);
    } else if (name === "username") {
      setUsername(value);
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
      <img src={chatIcon} alt="Register" className="form-header-image" />
      <form className="register-form" onSubmit={handleSubmit}>
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
          value={username}
          type="text" /* Corrected from "username" */
          placeholder="Name"
          id="username"
          name="username"
          onChange={handleChange}
        />
        {errors.username && <p className="error">{errors.username}</p>}
        <input
          value={phoneNumber}
          type="tel"
          placeholder="Phone Number"
          id="phone"
          name="phone"
          onChange={handleChange}
        />
        {errors.phone && <p className="error">{errors.phone}</p>}
        {errors.form && <p className="error">{errors.form}</p>}
        <button type="submit">Register</button>
      </form>
      <button className="link-btn" onClick={() => onFormSwitch("login")}>
        Already have an account? Login here
      </button>
    </div>
  );
};
