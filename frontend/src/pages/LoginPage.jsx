import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const submitForm = async (e) => {
    e.preventDefault();
    setError(null);

    const user = {
      username,
      password,
    };

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to log in");
      }

      localStorage.setItem("user", JSON.stringify(data));
      window.dispatchEvent(new Event("userChanged"));

      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="create">
      <h2>Log In</h2>

      <form onSubmit={submitForm}>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button>Log In</button>

        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default LoginPage;