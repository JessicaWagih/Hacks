import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  signup,
} from "../api";


export default function Signup() {

  const navigate = useNavigate();


  const [
    form,
    setForm
  ] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
  });


  const [
    error,
    setError
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(false);


  function updateField(
    field,
    value
  ) {

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

  }


  async function handleSubmit(e) {

    e.preventDefault();

    setError("");
    setLoading(true);


    try {

      await signup(form);

      navigate("/login");

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

      <div className="auth-card signup-card">

        <div className="auth-logo">
          ✨
        </div>


        <div className="auth-heading">

          <span>
            JOIN US
          </span>

          <h1>
            Create an account
          </h1>

          <p>
            Your details are saved securely,
            so you don't have to enter them
            every time you report something.
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

          <div className="two-column">

            <label>
              First name

              <input
                value={form.first_name}
                onChange={(e) =>
                  updateField(
                    "first_name",
                    e.target.value
                  )
                }
                placeholder="Jessica"
                required
              />

            </label>


            <label>
              Last name

              <input
                value={form.last_name}
                onChange={(e) =>
                  updateField(
                    "last_name",
                    e.target.value
                  )
                }
                placeholder="Smith"
                required
              />

            </label>

          </div>


          <label>
            Email address

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                updateField(
                  "email",
                  e.target.value
                )
              }
              placeholder="you@example.com"
              required
            />

          </label>


          <label>
            Password

            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                updateField(
                  "password",
                  e.target.value
                )
              }
              placeholder="At least 8 characters"
              minLength={8}
              required
            />

          </label>


          <label>
            Phone number
            <span className="optional">
              optional
            </span>

            <input
              type="tel"
              value={form.phone_number}
              onChange={(e) =>
                updateField(
                  "phone_number",
                  e.target.value
                )
              }
              placeholder="(555) 123-4567"
            />

          </label>


          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account →"}
          </button>

        </form>


        <div className="auth-footer">

          Already have an account?

          {" "}

          <Link to="/login">
            Log in
          </Link>

        </div>

      </div>

    </div>
  );
}