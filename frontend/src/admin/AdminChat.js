import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import EmojiConvertor from 'emoji-js';

const AdminChat = () => {
  const [userId, setUserId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [role, setRole] = useState(null);
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showArchivedChats, setShowArchivedChats] = useState(false);
  const [archivedChats, setArchivedChats] = useState([]);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const messagesEndRef = useRef(null);
  const emojiConvertor = new EmojiConvertor();
  emojiConvertor.replace_mode = 'unified';
  emojiConvertor.allow_native = true;

  const getToken = () => {
    return localStorage.getItem("adminToken");
  };

  const formatTimeIST = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata"
    });
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return formatTimeIST(timestamp);
    }
  };

  const formatLastSeen = (lastSeen, isOnline) => {
    if (isOnline) return "Online";
    if (!lastSeen) return "Never";
    return getRelativeTime(lastSeen);
  };

  const getDateLabel = (timestamp) => {
    const msgDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = msgDate.toDateString() === today.toDateString();
    const isYesterday = msgDate.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return msgDate.toLocaleDateString("en-IN");
  };

  const onEmojiClick = (emojiData) => {
    // Handling different versions of emoji-picker-react
    const emoji = emojiData.emoji || emojiData.native || emojiData;
    if (typeof emoji === 'string') {
      if (editingMessage) {
        setEditText(prev => prev + emoji);
      } else {
        setInput(prev => prev + emoji);
      }
    }
    setShowEmojiPicker(false);
  };

  const addReaction = async (messageId, emoji) => {
    try {
      const token = getToken();
      const res = await fetch("/api/reactions/reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message_id: messageId,
          reaction: emoji
        })
      });

      if (res.ok) {
        if (selectedUser) {
          fetchMessages(selectedUser.id);
        }
      }
    } catch (err) {
      console.error("Add reaction error", err);
    }
  };

  const removeReaction = async (messageId) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/reactions/reactions/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        if (selectedUser) {
          fetchMessages(selectedUser.id);
        }
      }
    } catch (err) {
      console.error("Remove reaction error", err);
    }
  };

  const archiveChat = async (userIdToArchive) => {
    try {
      const token = getToken();
      const res = await fetch("/api/archive/archive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userIdToArchive
        })
      });

      if (res.ok) {
        fetchUsers();
        if (selectedUser && selectedUser.id === userIdToArchive) {
          setSelectedUser(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Archive chat error", err);
    }
  };

  const unarchiveChat = async (userIdToUnarchive) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/archive/archive/${userIdToUnarchive}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchArchivedChats();
        fetchUsers();
      }
    } catch (err) {
      console.error("Unarchive chat error", err);
    }
  };

  const fetchArchivedChats = async () => {
    try {
      const token = getToken();
      const res = await fetch("/api/archive/archive", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setArchivedChats(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Fetch archived chats error", err);
    }
  };

  const blockUser = async (userIdToBlock) => {
    try {
      const token = getToken();
      const res = await fetch("/api/block/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userIdToBlock
        })
      });

      if (res.ok) {
        fetchUsers();
        if (selectedUser && selectedUser.id === userIdToBlock) {
          setSelectedUser(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Block user error", err);
    }
  };

  const unblockUser = async (userIdToUnblock) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/block/block/${userIdToUnblock}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchBlockedUsers();
        fetchUsers();
      }
    } catch (err) {
      console.error("Unblock user error", err);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const token = getToken();
      const res = await fetch("/api/block/block", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Fetch blocked users error", err);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setShowMessageMenu(null);
        if (selectedUser) {
          fetchMessages(selectedUser.id);
        }
      }
    } catch (err) {
      console.error("Delete message error", err);
    }
  };

  const startEditMessage = (message) => {
    setEditingMessage(message.id);
    setEditText(message.message);
    setShowMessageMenu(null);
  };

  const saveEditMessage = async () => {
    try {
      const token = getToken();
      const res = await fetch(`/api/chat/messages/${editingMessage}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: editText
        })
      });

      if (res.ok) {
        setEditingMessage(null);
        setEditText("");
        if (selectedUser) {
          fetchMessages(selectedUser.id);
        }
      }
    } catch (err) {
      console.error("Edit message error", err);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };

  const fetchMessages = async (uid) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/chat/${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("fetchMessages error", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getToken();
      const res = await fetch("/api/chat/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("fetchUsers error", err);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedUser || !ws) return;

    const msg = {
      receiver_id: selectedUser.id,
      message: input,
    };

    ws.send(JSON.stringify(msg));

    setMessages((prev) => [
      ...prev,
      {
        from: userId,
        message: input,
        timestamp: new Date().toISOString()
      },
    ]);

    setInput("");
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUserId(data.id);
          setRole(data.role);
        }
      } catch (err) {
        console.error("fetchMe error", err);
      }
    };

    fetchMe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const socket = new WebSocket(`ws://localhost:8000/api/ws/${userId}`);

    socket.onopen = () => console.log("Connected ✅");

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch {
        console.log("Invalid WS message");
      }
    };

    socket.onclose = () => console.log("Disconnected ❌");

    setWs(socket);

    return () => socket.close();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMessageMenu || showReactionPicker) {
        setShowMessageMenu(null);
        setShowReactionPicker(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMessageMenu, showReactionPicker]);

  let lastDate = "";

  return (
    <div style={{
      display: "flex",
      height: "88vh",
      borderRadius: "24px",
      overflow: "hidden",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: "0 20px 50px rgba(0, 0, 0, 0.1)",
      margin: "10px"
    }}>
      {/* Sidebar */}
      <div style={{
        width: 320,
        background: "rgba(255, 255, 255, 0.5)",
        borderRight: "1px solid rgba(229, 231, 235, 0.5)",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease"
      }}>
        <div style={{
          padding: "24px",
          borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
          background: "rgba(255, 255, 255, 0.2)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "20px",
              fontWeight: "700",
              letterSpacing: "-0.02em"
            }}>Messages</h3>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px"
            }}>
              {users.length}
            </div>
          </div>

          <div style={{
            display: "flex",
            gap: "8px",
            padding: "4px",
            background: "rgba(243, 244, 246, 0.8)",
            borderRadius: "12px",
            marginBottom: "8px"
          }}>
            <button
              onClick={() => {
                setShowArchivedChats(false);
                setShowBlockedUsers(false);
              }}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: "12px",
                background: !showArchivedChats && !showBlockedUsers ? "white" : "transparent",
                color: !showArchivedChats && !showBlockedUsers ? "#2563eb" : "#64748b",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s ease",
                boxShadow: !showArchivedChats && !showBlockedUsers ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
              }}
            >
              Active
            </button>
            <button
              onClick={() => {
                setShowArchivedChats(true);
                setShowBlockedUsers(false);
                if (!showArchivedChats) fetchArchivedChats();
              }}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: "12px",
                background: showArchivedChats ? "white" : "transparent",
                color: showArchivedChats ? "#2563eb" : "#64748b",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s ease",
                boxShadow: showArchivedChats ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
              }}
            >
              Archived
            </button>
            <button
              onClick={() => {
                setShowArchivedChats(false);
                setShowBlockedUsers(true);
                if (!showBlockedUsers) fetchBlockedUsers();
              }}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: "12px",
                background: showBlockedUsers ? "white" : "transparent",
                color: showBlockedUsers ? "#ef4444" : "#64748b",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s ease",
                boxShadow: showBlockedUsers ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
              }}
            >
              Blocked
            </button>
          </div>

          <div style={{
            marginTop: "16px",
            position: "relative",
            display: "flex",
            alignItems: "center"
          }}>
            <span style={{
              position: "absolute",
              left: "12px",
              fontSize: "14px",
              color: "#94a3b8",
              pointerEvents: "none"
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: "12px",
                border: "1px solid rgba(229, 231, 235, 0.5)",
                background: "rgba(255, 255, 255, 0.5)",
                fontSize: "13px",
                color: "#1e293b",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "rgba(229, 231, 235, 0.5)"}
            />
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          scrollbarWidth: "none"
        }}>
          {!showArchivedChats && !showBlockedUsers ? (
            (() => {
              const filtered = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
              if (filtered.length === 0) {
                return (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.5 }}>{searchTerm ? "🔎" : "📭"}</div>
                    <p style={{ fontSize: "14px", fontWeight: "500" }}>{searchTerm ? `No results for "${searchTerm}"` : "No active chats"}</p>
                    <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>
                      {searchTerm ? "Try searching for a different name" : "Start a conversation with your customers"}
                    </p>
                  </div>
                );
              }
              return filtered.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px",
                    borderRadius: "16px",
                    cursor: "pointer",
                    background: selectedUser?.id === u.id
                      ? "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"
                      : hoveredUser === u.id
                        ? "rgba(248, 250, 252, 0.8)"
                        : "transparent",
                    marginBottom: "8px",
                    border: selectedUser?.id === u.id
                      ? "1px solid #bae6fd"
                      : "1px solid transparent",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative"
                  }}
                  onMouseEnter={() => setHoveredUser(u.id)}
                  onMouseLeave={() => setHoveredUser(null)}
                  onClick={() => {
                    setSelectedUser(u);
                    fetchMessages(u.id);
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#475569",
                      marginRight: "16px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                    }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: u.is_online ? "#10b981" : "#94a3b8",
                      position: "absolute",
                      bottom: "-2px",
                      right: "14px",
                      border: "2px solid white",
                      boxShadow: u.is_online ? "0 0 10px rgba(16, 185, 129, 0.4)" : "none"
                    }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "4px"
                    }}>
                      <h4 style={{
                        margin: 0,
                        fontWeight: "600",
                        color: "#1e293b",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        {u.name}
                      </h4>
                      <span style={{
                        fontSize: "10px",
                        color: "#94a3b8",
                        fontWeight: "500"
                      }}>
                        {formatLastSeen(u.last_seen, u.is_online)}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#64748b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      opacity: 0.8
                    }}>
                      {u.email}
                    </p>
                  </div>

                  {hoveredUser === u.id && (
                    <div style={{
                      display: "flex",
                      gap: "4px",
                      marginLeft: "8px",
                      animation: "fadeIn 0.2s ease"
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveChat(u.id);
                        }}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: "#fffbeb",
                          color: "#f59e0b",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px"
                        }}
                        title="Archive"
                      >
                        📦
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          blockUser(u.id);
                        }}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: "#fef2f2",
                          color: "#ef4444",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px"
                        }}
                        title="Block"
                      >
                        🚫
                      </button>
                    </div>
                  )}
                </div>
              ))
            })()
          ) : showArchivedChats ? (
            archivedChats.map((chat) => (
              <div
                key={chat.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  background: "rgba(248, 250, 252, 0.5)",
                  marginBottom: "8px",
                  border: "1px solid rgba(229, 231, 235, 0.5)"
                }}
              >
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                  fontSize: "16px"
                }}>
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: "#1e293b" }}>{chat.name}</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Archived</div>
                </div>
                <button
                  onClick={() => unarchiveChat(chat.user_id)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "#ecfdf5",
                    color: "#10b981",
                    border: "none",
                    cursor: "pointer"
                  }}
                  title="Unarchive"
                >
                  ↩️
                </button>
              </div>
            ))
          ) : (
            blockedUsers.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  background: "rgba(254, 242, 242, 0.5)",
                  marginBottom: "8px",
                  border: "1px solid rgba(254, 202, 202, 0.5)"
                }}
              >
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                  fontSize: "16px"
                }}>
                  🚫
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: "#1e293b" }}>{user.name}</div>
                  <div style={{ fontSize: "11px", color: "#ef4444" }}>Blocked</div>
                </div>
                <button
                  onClick={() => unblockUser(user.user_id)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "#ecfdf5",
                    color: "#10b981",
                    border: "none",
                    cursor: "pointer"
                  }}
                  title="Unblock"
                >
                  ↩️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "transparent" }}>
        {/* Chat Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
          background: "rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(10px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          {selectedUser ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "16px",
                fontWeight: "700",
                marginRight: "12px",
                boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)"
              }}>
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>{selectedUser.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: selectedUser.is_online ? "#10b981" : "#94a3b8"
                  }} />
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
                    {selectedUser.is_online ? "Active Now" : `Last seen ${formatLastSeen(selectedUser.last_seen, false)}`}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontWeight: "600", color: "#64748b" }}>Select a conversation</div>
          )}
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          padding: "24px",
          overflowY: "auto",
          background: "rgba(241, 245, 249, 0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          scrollbarWidth: "none"
        }}>
          {messages.length === 0 && !selectedUser ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#94a3b8",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px", opacity: 0.5 }}>💬</div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>Welcome to Admin Chat</h3>
              <p style={{ maxWidth: "280px", fontSize: "14px", lineHeight: "1.6" }}>
                Select a user from the sidebar to view message history and start a conversation.
              </p>
            </div>
          ) : (
            messages.map((m, i) => {
              const isMine = m.sender_id === userId || m.from === userId;
              const timestamp = m.timestamp || m.created_at || new Date().toISOString();
              const dateLabel = getDateLabel(timestamp);

              const showDate = dateLabel !== lastDate;
              lastDate = dateLabel;

              return (
                <React.Fragment key={i}>
                  {showDate && (
                    <div style={{
                      textAlign: "center",
                      margin: "24px 0",
                      position: "relative"
                    }}>
                      <div style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        height: "1px",
                        background: "rgba(229, 231, 235, 0.5)",
                        zIndex: 0
                      }} />
                      <span style={{
                        position: "relative",
                        background: "#f1f5f9",
                        padding: "4px 12px",
                        fontSize: "11px",
                        color: "#64748b",
                        fontWeight: "600",
                        borderRadius: "20px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        zIndex: 1,
                        border: "1px solid rgba(229, 231, 235, 0.5)"
                      }}>
                        {dateLabel}
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: isMine ? "flex-end" : "flex-start",
                      marginBottom: "12px",
                      position: "relative",
                      animation: "fadeIn 0.3s ease",
                      zIndex: hoveredMessage === m.id || showMessageMenu === m.id || showReactionPicker === m.id ? 10 : 1
                    }}
                    onMouseEnter={() => setHoveredMessage(m.id)}
                    onMouseLeave={() => setHoveredMessage(null)}
                  >
                    <div style={{
                      maxWidth: "75%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMine ? "flex-end" : "flex-start"
                    }}>
                      <div style={{
                        background: isMine
                          ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                          : "white",
                        color: isMine ? "white" : "#1e293b",
                        padding: "12px 16px",
                        borderRadius: isMine ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        fontWeight: "500",
                        boxShadow: isMine
                          ? "0 4px 15px rgba(37, 99, 235, 0.2)"
                          : "0 4px 15px rgba(0, 0, 0, 0.03)",
                        border: isMine ? "none" : "1px solid rgba(229, 231, 235, 0.5)",
                        position: "relative",
                        transition: "all 0.2s ease",
                        transform: hoveredMessage === m.id ? "translateY(-1px)" : "translateY(0)"
                      }}>
                        {editingMessage === m.id ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px" }}>
                            <input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              style={{
                                background: isMine ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.3)",
                                borderRadius: "8px",
                                padding: "8px",
                                color: isMine ? "white" : "black",
                                outline: "none",
                                fontSize: "14px"
                              }}
                              autoFocus
                            />
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={saveEditMessage}
                                style={{
                                  flex: 1,
                                  padding: "6px",
                                  borderRadius: "6px",
                                  background: "#10b981",
                                  border: "none",
                                  color: "white",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  fontSize: "12px"
                                }}
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                style={{
                                  flex: 1,
                                  padding: "6px",
                                  borderRadius: "6px",
                                  background: "transparent",
                                  border: "1px solid rgba(156, 163, 175, 0.5)",
                                  color: isMine ? "white" : "#4b5563",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  fontSize: "12px"
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ wordBreak: "break-word" }}>{emojiConvertor.replace_colons(m.message)}</div>
                            <div style={{
                              fontSize: "10px",
                              marginTop: "4px",
                              opacity: 0.7,
                              textAlign: "right",
                              fontWeight: "500"
                            }}>
                              {formatTimeIST(timestamp)}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Reactions display */}
                      {m.reactions && Object.keys(m.reactions).length > 0 && (
                        <div style={{
                          display: "flex",
                          gap: "4px",
                          marginTop: "-8px",
                          zIndex: 2,
                          padding: "0 8px"
                        }}>
                          {Object.entries(m.reactions).map(([emoji, reactors]) => (
                            <div
                              key={emoji}
                              style={{
                                background: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "2px 8px",
                                fontSize: "12px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              title={reactors.map(r => r.user_name).join(", ")}
                              onClick={() => {
                                const hasUserReacted = reactors.some(r => r.user_id === userId);
                                if (hasUserReacted) {
                                  removeReaction(m.id);
                                } else {
                                  addReaction(m.id, emoji);
                                }
                              }}
                            >
                              <span>{emoji}</span>
                              <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b" }}>{reactors.length}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons on hover */}
                    {(hoveredMessage === m.id || showMessageMenu === m.id || showReactionPicker === m.id) && !editingMessage && (
                      <div 
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          margin: isMine ? "0 12px 0 0" : "0 0 0 12px",
                          order: isMine ? -1 : 1,
                          zIndex: 100
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setShowReactionPicker(showReactionPicker === m.id ? null : m.id)}
                          style={{
                            background: "rgba(255, 255, 255, 0.8)",
                            border: "1px solid #e2e8f0",
                            borderRadius: "50%",
                            width: "30px",
                            height: "30px",
                            cursor: "pointer",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                            transition: "all 0.2s"
                          }}
                        >
                          😊
                        </button>
                        {isMine && (
                          <button
                            onClick={() => setShowMessageMenu(showMessageMenu === m.id ? null : m.id)}
                            style={{
                              background: "rgba(255, 255, 255, 0.8)",
                              border: "1px solid #e2e8f0",
                              borderRadius: "50%",
                              width: "30px",
                              height: "30px",
                              cursor: "pointer",
                              fontSize: "14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                              transition: "all 0.2s"
                            }}
                          >
                            ⋮
                          </button>
                        )}

                        {/* Reaction Picker Popover */}
                        {showReactionPicker === m.id && (
                          <div style={{
                            position: "absolute",
                            bottom: "100%",
                            [isMine ? 'right' : 'left']: "40px",
                            marginBottom: "10px",
                            background: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "24px",
                            padding: "8px 12px",
                            display: "flex",
                            gap: "8px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            zIndex: 100,
                            animation: "scaleIn 0.2s ease"
                          }}>
                            {["❤️", "👍", "🔥", "😂", "😢", "😮"].map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  addReaction(m.id, emoji);
                                  setShowReactionPicker(null);
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "20px",
                                  transition: "transform 0.2s",
                                  padding: 0
                                }}
                                onMouseEnter={(e) => e.target.style.transform = "scale(1.3)"}
                                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Message Menu Popover */}
                        {showMessageMenu === m.id && isMine && (
                          <div style={{
                            position: "absolute",
                            bottom: "100%",
                            [isMine ? 'right' : 'left']: "40px",
                            marginBottom: "10px",
                            background: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            padding: "6px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            zIndex: 100,
                            minWidth: "120px",
                            animation: "scaleIn 0.2s ease"
                          }}>
                            <button
                              onClick={() => startEditMessage(m)}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "8px 12px",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "500",
                                color: "#1e293b",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                              }}
                              onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
                              onMouseLeave={(e) => e.target.style.background = "transparent"}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => deleteMessage(m.id)}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "8px 12px",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "500",
                                color: "#ef4444",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                              }}
                              onMouseEnter={(e) => e.target.style.background = "#fef2f2"}
                              onMouseLeave={(e) => e.target.style.background = "transparent"}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {selectedUser && (
          <div style={{
            padding: "20px 24px",
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(229, 231, 235, 0.5)",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            position: "relative"
          }}>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                width: "44px",
                height: "44px",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                transition: "all 0.2s",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#f8fafc";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.transform = "scale(1)";
              }}
            >
              😊
            </button>

            <div style={{ flex: 1, position: "relative" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#1e293b",
                  outline: "none",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.02)"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "0 2px 5px rgba(0,0,0,0.02)";
                }}
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                  : "#e2e8f0",
                color: input.trim() ? "white" : "#94a3b8",
                border: "none",
                borderRadius: "12px",
                padding: "0 20px",
                height: "44px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: input.trim() ? "pointer" : "default",
                transition: "all 0.2s",
                boxShadow: input.trim() ? "0 4px 10px rgba(37, 99, 235, 0.2)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                if (input.trim()) {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 6px 15px rgba(37, 99, 235, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (input.trim()) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 10px rgba(37, 99, 235, 0.2)";
                }
              }}
            >
              <span>Send</span>
              {/* <span style={{ fontSize: "16px" }}>🚀</span> */}
            </button>

            {showEmojiPicker && (
              <div style={{
                position: "absolute",
                bottom: "80px",
                left: "24px",
                zIndex: 1000,
                boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #e2e8f0"
              }}>
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  autoFocusSearch={false}
                  theme="light"
                  width={320}
                  height={400}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
