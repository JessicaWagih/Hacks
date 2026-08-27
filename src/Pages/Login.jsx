import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  login,
  getMe,
} from "../api";


export default function Login({
  setUser,
}) {

  const navigate = useNavigate();


  const [
    email,
    setEmail
  ] = useState("");


  const [
    password,
    setPassword
  ] = useState("");


  const [
    error,
    setError
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(false);


  async function handleSubmit(e) {

    e.preventDefault();

    setError("");
    setLoading(true);


    try {

      await login(
        email,
        password
      );

      const me = await getMe();

      setUser(me);

      navigate("/");

    } catch (err) {

      setError(
        err.message
      );

    } finally {

      setLoading(false);

    }

  }


  return (
    <div className="auth-page">

      <div className="auth-decoration">
        ♡
      </div>


      <div className="auth-card">

        <div className="auth-logo">
          ♡
        </div>


        <div className="auth-heading">

          <span>
            WELCOME BACK
          </span>

          <h1>
            Log in
          </h1>

          <p>
            Let's help some lost things
            find their way home.
          </p>

        </div>


        {error && (
          <div className="error-box">
            {error}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

          <label>
            Email address

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              required
            />

          </label>


          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              required
            />

          </label>


          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Log in →"}
          </button>

        </form>


        <div className="auth-footer">

          Don't have an account?

          {" "}

          <Link to="/signup">
            Sign up
          </Link>

        </div>

      </div>

    </div>
  );
}