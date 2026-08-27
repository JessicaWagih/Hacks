import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api";


export default function Notifications() {

  const [
    notifications,
    setNotifications
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  async function loadNotifications() {

    try {

      const data =
        await getNotifications();

      setNotifications(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadNotifications();

  }, []);


  async function readNotification(
    notification
  ) {

    if (!notification.is_read) {

      await markNotificationRead(
        notification.id
      );

      setNotifications(
        notifications.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      );

    }

  }


  async function readAll() {

    await markAllNotificationsRead();

    setNotifications(
      notifications.map(
        (notification) => ({
          ...notification,
          is_read: true,
        })
      )
    );

  }


  return (
    <div className="simple-page">

      <div className="page-heading">

        <div>

          <span>
            STAY UPDATED
          </span>

          <h1>
            Notifications
          </h1>

        </div>


        {notifications.some(
          (n) => !n.is_read
        ) && (

          <button
            onClick={readAll}
            className="text-button"
          >
            Mark all as read
          </button>

        )}

      </div>


      <div className="notification-list">

        {loading ? (

          <div className="empty-state">
            Loading...
          </div>

        ) : notifications.length === 0 ? (

          <div className="empty-state">

            <div>
              ♡
            </div>

            <h3>
              You're all caught up!
            </h3>

            <p>
              We'll let you know when
              something happens.
            </p>

          </div>

        ) : (

          notifications.map(
            (notification) => (

              <div
                key={notification.id}
                className={
                  notification.is_read
                    ? "notification-item"
                    : "notification-item unread"
                }
                onClick={() =>
                  readNotification(
                    notification
                  )
                }
              >

                <div className="notification-icon">

                  {notification.notification_type ===
                  "new_message"
                    ? "💬"
                    : notification.notification_type ===
                      "contact_shared"
                    ? "📱"
                    : "✨"}

                </div>


                <div className="notification-content">

                  <div className="notification-title-row">

                    <h3>
                      {notification.title}
                    </h3>

                    {!notification.is_read && (
                      <span className="unread-dot" />
                    )}

                  </div>


                  <p>
                    {notification.message}
                  </p>


                  <small>
                    {new Date(
                      notification.created_at
                    ).toLocaleString()}
                  </small>


                  {notification.match_id && (
                    <Link
                      to={
                        notification.notification_type ===
                        "new_message"
                          ? `/chat/${notification.match_id}`
                          : "/matches"
                      }
                      className="notification-action"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      {notification.notification_type ===
                      "new_message"
                        ? "Open conversation →"
                        : "View match →"}
                    </Link>
                  )}

                </div>

              </div>

            )
          )

        )}

      </div>

    </div>
  );
}