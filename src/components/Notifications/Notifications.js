"use client";
import { useEffect, useState } from "react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data));
  }, []);

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      {notifications.length > 0 ? (
        notifications.map((notif, index) => <p key={index}>{notif.message}</p>)
      ) : (
        <p>No notifications yet.</p>
      )}
    </div>
  );
}
