// frontend-travel-discovery/src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ switchForm }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function validateEmail(email) {
    return /.+@.+\..+/.test(email);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Frontend validations
    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");

    try {
      const res = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid login");
        return;
      }

      // ✅ Save user in localStorage (for navbar/profile/protected routes)
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Logged in successfully!");

      // clear form
      setEmail("");
      setPassword("");
      setError("");

      // ✅ Go to home page
      navigate("/");
    } catch (err) {
      console.error("Login fetch error:", err);
      setError("Server error, please try again later.");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Login</h2>

      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <div className="form-error">{error}</div>

      <button type="submit">Login</button>

      <p>
        Don't have an account?{" "}
        <button
          type="button"
          className="link-button"
          onClick={switchForm}
        >
          Register
        </button>
      </p>
    </form>
  );
}

export default Login;