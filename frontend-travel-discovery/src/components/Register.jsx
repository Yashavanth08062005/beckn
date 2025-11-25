import React, { useState } from "react";

function Register({ switchForm }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function validateEmail(email) {
    return /.+@.+\..+/.test(email);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validations
    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
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
      const res = await fetch("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Backend table me column ka naam "name" hai,
        // isliye yaha username ko "name" key ke andar bhej rahe hain
        body: JSON.stringify({
          name: username,
          email,
          password,
        }),
      });

      const data = await res.json();
      console.log("Register response:", data);

      if (!res.ok || !data.success) {
        setError(data.message || "Server error, please try again later.");
        return;
      }

      alert("Registered successfully!");

      // Form clear
      setUsername("");
      setEmail("");
      setPassword("");
      setError("");

      // Login form pe switch
      switchForm();
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Server error, please try again later.");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Register</h2>

      <label>Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />

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

      {error && <div className="form-error">{error}</div>}

      <button type="submit">Register</button>

      <p>
        Already have an account?{" "}
        <button
          type="button"
          className="link-button"
          onClick={switchForm}
        >
          Login
        </button>
      </p>
    </form>
  );
}

export default Register;
