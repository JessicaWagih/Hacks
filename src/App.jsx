import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo" onClick={() => setPage("home")}>
          <span className="logo-icon">🔎</span>
          <span>Lost & Found</span>
        </div>

        <div className="nav-links">
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("profile")}>Profile</button>
          <button onClick={() => setPage("notifications")}>
            🔔 Notifications
          </button>
          <button onClick={() => setPage("inbox")}>💬 Inbox</button>
        </div>

        <button className="login-button" onClick={() => setPage("login")}>
          Login
        </button>
      </nav>

      {/* PAGE CONTENT */}
      {page === "home" && <Home setPage={setPage} />}
      {page === "login" && <Login setPage={setPage} />}
      {page === "signup" && <Signup setPage={setPage} />}
      {page === "profile" && <Profile />}
      {page === "notifications" && <Notifications />}
      {page === "inbox" && <Inbox />}
      {page === "lost" && <ReportLost />}
      {page === "found" && <ReportFound />}
    </div>
  );
}


/* =========================
   HOME
========================= */

function Home({ setPage }) {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-text">
          <div className="welcome-pill">✨ Welcome to Lost & Found</div>

          <h1>
            Lost something?
            <br />
            <span>Let's find it.</span>
          </h1>

          <p>
            A simple and friendly way to report lost items, report things
            you've found, and connect with the right person.
          </p>

          <div className="home-buttons">
            <button
              className="primary-button"
              onClick={() => setPage("lost")}
            >
              😭 I Lost Something
            </button>

            <button
              className="secondary-button"
              onClick={() => setPage("found")}
            >
              🎉 I Found Something
            </button>
          </div>
        </div>

        <div className="hero-card">
          <div className="floating-card card-one">
            🎧
            <div>
              <strong>AirPods</strong>
              <small>Possible match!</small>
            </div>
          </div>

          <div className="main-heart">💗</div>

          <div className="floating-card card-two">
            📱
            <div>
              <strong>iPhone</strong>
              <small>Found nearby</small>
            </div>
          </div>
        </div>
      </section>

      <section className="how-section">
        <h2>How it works 💕</h2>
        <p className="section-subtitle">
          Getting your stuff back is easier than ever.
        </p>

        <div className="steps">
          <div className="step">
            <div className="step-icon">📝</div>
            <h3>Report it</h3>
            <p>Tell us what you lost or found.</p>
          </div>

          <div className="step">
            <div className="step-icon">🗺️</div>
            <h3>Pick a location</h3>
            <p>Choose the location directly on the map.</p>
          </div>

          <div className="step">
            <div className="step-icon">✨</div>
            <h3>Get matched</h3>
            <p>Our system looks for possible matches.</p>
          </div>

          <div className="step">
            <div className="step-icon">💬</div>
            <h3>Chat safely</h3>
            <p>Connect without sharing your phone number.</p>
          </div>
        </div>
      </section>
    </main>
  );
}


/* =========================
   LOGIN
========================= */

function Login({ setPage }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">🔎</div>

        <h1>Welcome back!</h1>
        <p>Log in to your Lost & Found account.</p>

        <form>
          <label>Email address</label>
          <input type="email" placeholder="you@example.com" />

          <label>Password</label>
          <input type="password" placeholder="••••••••" />

          <button className="primary-button auth-submit">
            Log In
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p className="signup-text">
          Don't have an account?{" "}
          <button
            className="text-button"
            onClick={() => setPage("signup")}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}


/* =========================
   SIGN UP
========================= */

function Signup({ setPage }) {
  return (
    <div className="auth-page">
      <div className="auth-card signup-card">
        <div className="auth-icon">💗</div>

        <h1>Create an account</h1>
        <p>It only takes a minute!</p>

        <form>
          <div className="name-row">
            <div>
              <label>First name</label>
              <input type="text" placeholder="Jessica" />
            </div>

            <div>
              <label>Last name</label>
              <input type="text" placeholder="Smith" />
            </div>
          </div>

          <label>Email address</label>
          <input type="email" placeholder="you@example.com" />

          <label>Password</label>
          <input type="password" placeholder="Create a password" />

          <label>Phone number <span>(optional)</span></label>
          <input type="tel" placeholder="(555) 123-4567" />

          <label>Profile picture <span>(optional)</span></label>
          <input type="file" accept="image/*" />

          <button className="primary-button auth-submit">
            Create Account
          </button>
        </form>

        <p className="signup-text">
          Already have an account?{" "}
          <button
            className="text-button"
            onClick={() => setPage("login")}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}


/* =========================
   PROFILE
========================= */

function Profile() {
  return (
    <main className="simple-page">
      <div className="page-header">
        <span>👤</span>
        <div>
          <h1>My Profile</h1>
          <p>Manage your account information.</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="avatar">👤</div>

        <h2>Your Name</h2>
        <p>you@example.com</p>

        <button className="secondary-button">
          Edit Profile
        </button>
      </div>
    </main>
  );
}


/* =========================
   NOTIFICATIONS
========================= */

function Notifications() {
  return (
    <main className="simple-page">
      <div className="page-header">
        <span>🔔</span>
        <div>
          <h1>Notifications</h1>
          <p>We'll let you know when something happens.</p>
        </div>
      </div>

      <div className="notification-card">
        <div className="notification-icon">🎉</div>
        <div>
          <strong>Welcome to Lost & Found!</strong>
          <p>
            You'll receive a notification when someone reports a
            possible match.
          </p>
          <small>Just now</small>
        </div>
      </div>
    </main>
  );
}


/* =========================
   INBOX
========================= */

function Inbox() {
  return (
    <main className="simple-page">
      <div className="page-header">
        <span>💬</span>
        <div>
          <h1>Inbox</h1>
          <p>Chat privately with people you've been matched with.</p>
        </div>
      </div>

      <div className="empty-state">
        <div>💬</div>
        <h2>No conversations yet</h2>
        <p>
          When there's a match, your conversation will appear here.
        </p>
      </div>
    </main>
  );
}


/* =========================
   REPORT LOST
========================= */

function ReportLost() {
  return (
    <main className="report-page">
      <div className="report-header">
        <span>😭</span>
        <div>
          <h1>Report a Lost Item</h1>
          <p>Don't worry — let's help you find it.</p>
        </div>
      </div>

      <div className="form-card">
        <label>What did you lose?</label>
        <textarea
          placeholder="Describe your item..."
          rows="4"
        />

        <label>Date</label>
        <input type="date" />

        <label>Time</label>
        <input type="time" />

        <label>Where did you lose it?</label>

        <div className="map-placeholder">
          🗺️
          <strong>Map goes here</strong>
          <span>You'll be able to pick a location on the map.</span>
        </div>

        <button className="location-button">
          📍 Use my current location
        </button>

        <label>Photo <span>(optional)</span></label>
        <input type="file" accept="image/*" />

        <button className="primary-button full-button">
          Report Lost Item
        </button>
      </div>
    </main>
  );
}


/* =========================
   REPORT FOUND
========================= */

function ReportFound() {
  return (
    <main className="report-page">
      <div className="report-header">
        <span>🎉</span>
        <div>
          <h1>Report a Found Item</h1>
          <p>Let's help get this item back to its owner.</p>
        </div>
      </div>

      <div className="form-card">
        <label>What did you find?</label>
        <textarea
          placeholder="Describe the item..."
          rows="4"
        />

        <label>Date</label>
        <input type="date" />

        <label>Time</label>
        <input type="time" />

        <label>Where did you find it?</label>

        <div className="map-placeholder">
          🗺️
          <strong>Map goes here</strong>
          <span>You'll be able to pick a location on the map.</span>
        </div>

        <button className="location-button">
          📍 Use my current location
        </button>

        <label>Photo</label>
        <input type="file" accept="image/*" />

        <button className="primary-button full-button">
          Report Found Item
        </button>
      </div>
    </main>
  );
}


export default App;