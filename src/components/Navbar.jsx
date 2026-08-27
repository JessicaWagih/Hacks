import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  logout,
  getUnreadNotificationCount,
} from "../api";

import {
  useEffect,
  useState,
} from "react";


export default function Navbar({
  user,
  setUser,
}) {

  const navigate = useNavigate();
  const location = useLocation();

  const [
    unreadCount,
    setUnreadCount
  ] = useState(0);


  useEffect(() => {

    if (!user) {
      setUnreadCount(0);
      return;
    }

    async function loadCount() {

      try {

        const data =
          await getUnreadNotificationCount();

        setUnreadCount(data.count);

      } catch {
        // Ignore
      }
    }

    loadCount();

    const interval = setInterval(
      loadCount,
      10000
    );

    return () => clearInterval(interval);

  }, [user, location.pathname]);


  function handleLogout() {

    logout();

    setUser(null);

    navigate("/");

  }


  return (
    <nav className="navbar">

      <div className="navbar-left">

        <Link
          to="/"
          className="brand"
        >
          <span className="brand-icon">
            ♡
          </span>

          <span>
            Lost & Found
          </span>
        </Link>

      </div>


      <div className="navbar-center">

        <Link
          to="/"
          className={
            location.pathname === "/"
              ? "nav-link active"
              : "nav-link"
          }
        >
          Home
        </Link>


        {user && (
          <>
            <Link
              to="/profile"
              className={
                location.pathname === "/profile"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Profile
            </Link>


            <Link
              to="/notifications"
              className={
                location.pathname === "/notifications"
                  ? "nav-link notification-link active"
                  : "nav-link notification-link"
              }
            >
              Notifications

              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}
            </Link>


            <Link
              to="/inbox"
              className={
                location.pathname.startsWith("/inbox") ||
                location.pathname.startsWith("/chat")
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Inbox
            </Link>
          </>
        )}

      </div>


      <div className="navbar-right">

        {!user ? (

          <Link
            to="/login"
            className="login-nav-button"
          >
            Log in
          </Link>

        ) : (

          <div className="user-nav">

            <Link
              to="/profile"
              className="mini-profile"
            >

              {user.profile_picture ? (

                <img
                  src={
                    `http://127.0.0.1:8000/${user.profile_picture}`
                  }
                  alt=""
                />

              ) : (

                <span>
                  {user.first_name
                    ?.charAt(0)
                    .toUpperCase()}
                </span>

              )}

            </Link>


            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Log out
            </button>

          </div>

        )}

      </div>

    </nav>
  );
}