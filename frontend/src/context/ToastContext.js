import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message) => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#1f2937",
              color: "white",
              padding: "10px 16px",
              borderRadius: 8,
              marginBottom: 10,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);