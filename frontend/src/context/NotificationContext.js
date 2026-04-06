import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const { showToast } = useToast();

  const token =
    localStorage.getItem("token") || localStorage.getItem("adminToken");

  useEffect(() => {
    const user =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("adminUser"));

    const userId = user?.id;

    if (!userId) return;

    const socket = new WebSocket(`ws://localhost:8000/api/ws/${userId}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "notification") {
        setNotifications((prev) => [data, ...prev]);

        showToast(data.message);
      }
    };

    return () => socket.close();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);